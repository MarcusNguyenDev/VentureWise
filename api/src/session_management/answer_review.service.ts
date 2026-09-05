import { Inject, Injectable } from '@nestjs/common';

import {
  AI_COACH_PORT,
  AiCoachPort,
  CandidateContext,
  CritiqueAnswerResult,
  DecodeSubtextResult,
} from '../ai_coach/ai_coach.contract';
import { QuestionLibraryService } from '../question_library/question_library.service';
import {
  DetectedUntranslatedPhrase,
  detectUntranslatedPhrases,
} from '../question_library/untranslated_phrase_detection.util';
import {
  countReclaimedVerbs,
  diffAnswerRewrite,
  DiffSegment,
} from '../speech_analysis/answer_diff.util';
import {
  DeliveryScoreResult,
  DeliveryScoreService,
} from '../speech_analysis/delivery_score.service';
import {
  analysePronounAttribution,
  PronounAttributionSummary,
} from '../speech_analysis/pronoun_attribution.util';
import { TranscriptWord } from '../speech_analysis/transcript_word.type';

/**
 * The slow loop: everything computed once, after the candidate stops speaking.
 *
 * The diff, the pronoun counts and the delivery score are deterministic and
 * computed here. Only the rewrite text, the subtext read and the length
 * variants cross the AI boundary.
 */

export interface AnswerReview {
  attempt_id: string;
  question_text: string;
  transcript_text: string;
  duration_seconds: number;
  pronoun_attribution: PronounAttributionSummary;
  /** The emotional beat of the demo: same story, verbs reclaimed. */
  rewrite_diff: DiffSegment[];
  reclaimed_verb_count: number;
  critique: CritiqueAnswerResult;
  subtext: DecodeSubtextResult;
  delivery: DeliveryScoreResult;
  untranslated_phrases: DetectedUntranslatedPhrase[];
  /** True when any part of this review came from fixtures. */
  is_partially_stubbed: boolean;
}

@Injectable()
export class AnswerReviewService {
  constructor(
    @Inject(AI_COACH_PORT) private readonly ai_coach: AiCoachPort,
    private readonly question_library_service: QuestionLibraryService,
    private readonly delivery_score_service: DeliveryScoreService,
  ) {}

  async buildReview(input: {
    candidate_context: CandidateContext | null;
    attempt_id: string;
    question_id: string;
    question_text: string;
    transcript_text: string;
    words: TranscriptWord[];
    duration_ms: number;
  }): Promise<AnswerReview> {
    const duration_seconds = Math.round(input.duration_ms / 1000);
    const untranslated_phrases = detectUntranslatedPhrases(
      input.transcript_text,
    );
    const question = this.question_library_service.findQuestion(
      input.question_id,
    );

    // Both model calls are independent, so they overlap rather than queue.
    const [critique, subtext] = await Promise.all([
      this.ai_coach.critiqueAnswer({
        candidate_context: input.candidate_context,
        question_text: input.question_text,
        transcript_text: input.transcript_text,
        duration_seconds,
      }),
      this.ai_coach.decodeSubtext({
        candidate_context: input.candidate_context,
        question_text: input.question_text,
        known_question_intent: question?.interviewer_intent ?? null,
        transcript_text: input.transcript_text,
        flagged_phrases: untranslated_phrases.map((phrase) => phrase.phrase),
      }),
    ]);

    const rewrite_diff = diffAnswerRewrite(
      input.transcript_text,
      critique.first_person_rewrite,
    );

    return {
      attempt_id: input.attempt_id,
      question_text: input.question_text,
      transcript_text: input.transcript_text,
      duration_seconds,
      pronoun_attribution: analysePronounAttribution(input.transcript_text),
      rewrite_diff,
      reclaimed_verb_count: countReclaimedVerbs(rewrite_diff),
      critique,
      subtext,
      delivery: this.delivery_score_service.scoreDelivery(
        input.transcript_text,
        input.words,
        input.duration_ms,
      ),
      untranslated_phrases: this.mergeUntranslatedPhrases(
        untranslated_phrases,
        subtext,
      ),
      is_partially_stubbed: critique.is_stubbed || subtext.is_stubbed,
    };
  }

  /**
   * The lexicon detection carries character offsets the model's version does
   * not, so lexicon hits win and model-only findings are appended without them.
   */
  private mergeUntranslatedPhrases(
    detected: DetectedUntranslatedPhrase[],
    subtext: DecodeSubtextResult,
  ): DetectedUntranslatedPhrase[] {
    const detected_phrases = new Set(
      detected.map((phrase) => phrase.phrase.toLowerCase()),
    );

    const model_only = subtext.untranslated_phrases
      .filter((phrase) => !detected_phrases.has(phrase.phrase.toLowerCase()))
      .map((phrase) => ({ ...phrase, char_start: -1, char_end: -1 }));

    return [...detected, ...model_only];
  }
}
