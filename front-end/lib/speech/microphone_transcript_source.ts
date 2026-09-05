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
export class MicrophoneTranscriptSource implements TranscriptSource {
  private recognition: SpeechRecognitionInstance | null = null;
  private started_at_ms = 0;

  start(handlers: TranscriptSourceHandlers): void {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      handlers.onError(
        "This browser has no Web Speech API. Use Chrome, or switch to canned replay.",
      );
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    this.started_at_ms = Date.now();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (
        let result_index = event.resultIndex;
        result_index < event.results.length;
        result_index += 1
      ) {
        const result = event.results[result_index];
        const text = result[0]?.transcript ?? "";
        if (text.trim().length === 0) continue;

        handlers.onChunk({
          chunk_index: result_index,
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

    recognition.onend = () => handlers.onEnd();

    this.recognition = recognition;
    recognition.start();
  }

  stop(): void {
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
