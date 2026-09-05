/**
 * One word as delivered by the ASR stream.
 *
 * Timings are milliseconds from the start of the answer. F-05 needs word-level
 * timings; the browser Web Speech API does not supply reliable ones, so words
 * sourced from it carry `has_reliable_timing: false` and the pause metrics are
 * suppressed rather than guessed.
 */
export interface TranscriptWord {
  text: string;
  start_ms: number;
  end_ms: number;
  has_reliable_timing: boolean;
}
