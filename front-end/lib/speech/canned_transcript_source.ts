import { buildCannedWords, type CannedWord } from "./canned_transcript.const";
import type {
  TranscriptSource,
  TranscriptSourceHandlers,
} from "./transcript_source.type";

/**
 * Replays a canned transcript word by word, in real time, honouring its pauses.
 *
 * This is not a shortcut — it drives exactly the same buffer the microphone
 * does, so every loop behaves identically. It also supplies real word timings,
 * which means F-05's pause coaching is only fully demonstrable in this mode.
 */
export class CannedTranscriptSource implements TranscriptSource {
  private timeout_id: ReturnType<typeof setTimeout> | null = null;
  private is_stopped = false;

  constructor(private readonly script: string) {}

  start(handlers: TranscriptSourceHandlers): void {
    const words = buildCannedWords(this.script);
    this.is_stopped = false;

    const emitWordAt = (word_index: number): void => {
      if (this.is_stopped) return;

      if (word_index >= words.length) {
        // One last final chunk so the buffer closes cleanly.
        handlers.onChunk(this.buildChunk(words, words.length, true));
        handlers.onEnd();
        return;
      }

      handlers.onChunk(this.buildChunk(words, word_index + 1, false));

      const current_word = words[word_index];
      const next_word: CannedWord | undefined = words[word_index + 1];
      const delay_ms = next_word
        ? next_word.start_ms - current_word.start_ms
        : current_word.end_ms - current_word.start_ms;

      this.timeout_id = setTimeout(() => emitWordAt(word_index + 1), delay_ms);
    };

    emitWordAt(0);
  }

  stop(): void {
    this.is_stopped = true;

    if (this.timeout_id !== null) {
      clearTimeout(this.timeout_id);
      this.timeout_id = null;
    }
  }

  /**
   * Always chunk zero: the replay revises one growing interim chunk, which is
   * what the buffer's supersede rule is built for.
   */
  private buildChunk(
    words: CannedWord[],
    word_count: number,
    is_final: boolean,
  ) {
    const spoken_words = words.slice(0, word_count);

    return {
      chunk_index: 0,
      text: spoken_words.map((word) => word.text).join(" "),
      // `follows_pause` is replay bookkeeping and is not part of the buffer's
      // word shape, so it is dropped rather than forwarded.
      words: spoken_words.map((word) => ({
        text: word.text,
        start_ms: word.start_ms,
        end_ms: word.end_ms,
        has_reliable_timing: word.has_reliable_timing,
      })),
      is_final,
    };
  }
}
