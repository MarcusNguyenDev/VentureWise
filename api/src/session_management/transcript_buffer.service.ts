import { Injectable } from '@nestjs/common';

import { TranscriptWord } from '../speech_analysis/transcript_word.type';
import { AnswerAttempt } from './entities/answer_attempt.entity';
import { TranscriptChunk } from './entities/transcript_chunk.entity';

/**
 * The append-only transcript buffer — the one hard dependency in the whole
 * build, per Part 6 of the spec.
 *
 * Every loop reads from here and none of them re-derives state. An interim
 * chunk can be superseded by a later version of the same index; a chunk that
 * has been marked final is immutable.
 */
@Injectable()
export class TranscriptBufferService {
  appendChunk(
    attempt: AnswerAttempt,
    chunk: {
      chunk_index: number;
      text: string;
      words: TranscriptWord[];
      is_final: boolean;
    },
  ): AnswerAttempt {
    const existing_index = attempt.chunks.findIndex(
      (candidate) => candidate.chunk_index === chunk.chunk_index,
    );

    const new_chunk: TranscriptChunk = {
      ...chunk,
      received_at_ms: Date.now(),
    };

    if (existing_index === -1) {
      return { ...attempt, chunks: [...attempt.chunks, new_chunk] };
    }

    // A final chunk is the last word on its index; a late interim is dropped.
    if (attempt.chunks[existing_index].is_final) return attempt;

    const chunks = [...attempt.chunks];
    chunks[existing_index] = new_chunk;

    return { ...attempt, chunks };
  }

  /** Everything said so far, interim chunks included. */
  readText(attempt: AnswerAttempt): string {
    return this.readOrderedChunks(attempt)
      .map((chunk) => chunk.text.trim())
      .filter((text) => text.length > 0)
      .join(' ');
  }

  readWords(attempt: AnswerAttempt): TranscriptWord[] {
    return this.readOrderedChunks(attempt).flatMap((chunk) => chunk.words);
  }

  /** Milliseconds of speech, measured from the attempt start. */
  readElapsedMs(attempt: AnswerAttempt): number {
    const end_ms = attempt.ended_at_ms ?? Date.now();
    return Math.max(end_ms - attempt.started_at_ms, 0);
  }

  private readOrderedChunks(attempt: AnswerAttempt): TranscriptChunk[] {
    return [...attempt.chunks].sort(
      (left, right) => left.chunk_index - right.chunk_index,
    );
  }
}
