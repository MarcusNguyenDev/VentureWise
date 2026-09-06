import type { TranscriptWord } from "../api/api_contracts";
import type {
  TranscriptSource,
  TranscriptSourceHandlers,
} from "./transcript_source.type";
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
  type SpeechRecognitionInstance,
} from "./web_speech_types";

/**
 * Live transcript from the browser's Web Speech API.
 *
 * Free and zero-infra, which is why the spec picks it for the demo. It does not
 * give word-level timings, so every word it produces is marked
 * `has_reliable_timing: false` and F-05 suppresses its pause metrics rather
 * than inventing numbers. The upgrade path is a streaming ASR with real word
 * timings — Deepgram or AssemblyAI — behind this same interface.
 */
/** Australian English. See the note where this is applied. */
export const SPEECH_RECOGNITION_LOCALE = "en-AU";

export class MicrophoneTranscriptSource implements TranscriptSource {
  private recognition: SpeechRecognitionInstance | null = null;
  private started_at_ms = 0;
  /** Set by `stop()`, so an expected end is not mistaken for a dropout. */
  private is_stopped = false;
  /**
   * Added to every incoming `resultIndex`.
   *
   * Chrome restarts number their results from zero again. Without an offset the
   * new chunk 0 collides with the previous session's chunk 0, which the
   * transcript buffer has already marked final and therefore refuses to
   * overwrite — so every word after the first restart would be silently
   * discarded and the transcript would simply stop growing.
   */
  private chunk_index_offset = 0;
  private highest_seen_index = -1;

  start(handlers: TranscriptSourceHandlers): void {
    this.is_stopped = false;
    this.chunk_index_offset = 0;
    this.highest_seen_index = -1;
    this.started_at_ms = Date.now();
    this.beginRecognitionSession(handlers);
  }

  /**
   * Opens one recognition session and re-opens it when it ends by itself.
   *
   * Chrome ends a session after a pause even with `continuous = true`, and
   * opening a camera stream mid-answer reliably ends it too — the browser
   * re-negotiates audio input. Neither is an error, so neither reaches
   * `onerror`; the session simply stops and, without this, the transcript
   * freezes with no indication anything went wrong.
   */
  private beginRecognitionSession(handlers: TranscriptSourceHandlers): void {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      handlers.onError(
        "This browser has no Web Speech API. Use Chrome, or switch to canned replay.",
      );
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    // en-AU, not en-US: the acoustic and vocabulary models differ, and this
    // candidate is speaking Australian place names, employer names and
    // workplace vocabulary. Getting "Woolworths" or "Wollongong" back as
    // nonsense makes the transcript useless.
    recognition.lang = SPEECH_RECOGNITION_LOCALE;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (
        let result_index = event.resultIndex;
        result_index < event.results.length;
        result_index += 1
      ) {
        const result = event.results[result_index];
        const text = result[0]?.transcript ?? "";
        if (text.trim().length === 0) continue;

        const chunk_index = this.chunk_index_offset + result_index;
        this.highest_seen_index = Math.max(this.highest_seen_index, chunk_index);

        handlers.onChunk({
          chunk_index,
          text,
          words: this.buildWords(text),
          is_final: result.isFinal,
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" fire in normal use and are not worth showing.
      if (event.error === "no-speech" || event.error === "aborted") return;

      handlers.onError(
        event.error === "not-allowed"
          ? "Microphone permission was denied. Switch to canned replay to keep going."
          : `Speech recognition failed: ${event.error}`,
      );
    };

    recognition.onend = () => {
      if (this.is_stopped) {
        handlers.onEnd();
        return;
      }

      // Continue where the last session left off rather than overwriting it.
      this.chunk_index_offset = this.highest_seen_index + 1;

      try {
        this.beginRecognitionSession(handlers);
      } catch {
        handlers.onError(
          "Speech recognition stopped and could not restart. Switch to canned replay to keep going.",
        );
        handlers.onEnd();
      }
    };

    this.recognition = recognition;

    try {
      recognition.start();
    } catch {
      // "already started" is thrown when a restart races the previous session
      // shutting down. The pending onend will retry, so it is not an error.
    }
  }

  stop(): void {
    this.is_stopped = true;
    this.recognition?.stop();
    this.recognition = null;
  }

  /**
   * The API gives no per-word timings, so words are spread evenly across the
   * elapsed time purely to keep the shape consistent. They are flagged
   * unreliable, and nothing that needs real timings uses them.
   */
  private buildWords(text: string): TranscriptWord[] {
    const tokens = text.split(/\s+/).filter((token) => token.length > 0);
    const elapsed_ms = Date.now() - this.started_at_ms;
    const per_word_ms = tokens.length > 0 ? elapsed_ms / tokens.length : 0;

    return tokens.map((token, index) => ({
      text: token,
      start_ms: Math.round(index * per_word_ms),
      end_ms: Math.round((index + 1) * per_word_ms),
      has_reliable_timing: false,
    }));
  }
}
