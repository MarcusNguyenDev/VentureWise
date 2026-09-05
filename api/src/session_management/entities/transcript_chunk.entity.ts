import { TranscriptWord } from '../../speech_analysis/transcript_word.type';

/**
 * One append to the transcript buffer.
 *
 * Interim ASR results are replaced by the final result for the same chunk
 * index; finals are never rewritten. That is what makes the buffer safe for
 * three loops to read concurrently at different clock speeds.
 */
export interface TranscriptChunk {
  chunk_index: number;
  text: string;
  words: TranscriptWord[];
  /** False while the ASR may still revise this chunk. */
  is_final: boolean;
  received_at_ms: number;
}
