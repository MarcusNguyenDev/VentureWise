import { Injectable } from '@nestjs/common';

import { MetricVerdict } from '../shared/types/metric_verdict.enum';
import { detectFillers, FillerSummary } from './filler_detection.util';
import {
  ClassifiedPause,
  classifyPauses,
  COACHABLE_RETRIEVAL_PAUSE_MS,
  PauseKind,
  suggestBridgePhrase,
} from './pause_classification.util';
import {
  measureSentenceResolution,
  SentenceResolutionSummary,
} from './sentence_resolution.util';
import { measureSpeakingPace, SpeakingPaceSummary } from './speaking_pace.util';
import { TranscriptWord } from './transcript_word.type';

/**
 * F-05, the accent-fair delivery score.
 *
 * Four things get scored, and the list of things deliberately left unscored is
 * part of the response rather than a footnote in marketing copy — the UI is
 * expected to render it.
 */

/** Published in the UI. Changing this list is a product decision, not a tweak. */
export const NOT_SCORED_BY_DESIGN: string[] = [
  'Accent',
  'Pronunciation',
  'Vocabulary sophistication',
  '"Confidence" inferred from voice',
  'Grammar typical of a second-language speaker',
  'Eye contact and video',
];

export interface DeliveryCoachingNote {
  about: string;
  suggestion: string;
}

export interface PausePlacementSummary {
  structural_count: number;
  word_retrieval_count: number;
  verdict: MetricVerdict;
  /** False when the ASR gave no reliable word timings. */
  is_measurable: boolean;
}

export interface DeliveryScoreResult {
  pace: SpeakingPaceSummary;
  pause_placement: PausePlacementSummary;
  fillers: FillerSummary;
  sentence_resolution: SentenceResolutionSummary;
  /** 0-100, the mean of the measurable components. */
  overall_score: number;
  coaching_notes: DeliveryCoachingNote[];
  not_scored_by_design: string[];
}

const VERDICT_POINTS: Record<MetricVerdict, number> = {
  [MetricVerdict.GOOD]: 100,
  [MetricVerdict.WATCH]: 65,
  [MetricVerdict.POOR]: 30,
};

@Injectable()
export class DeliveryScoreService {
  scoreDelivery(
    transcript_text: string,
    words: TranscriptWord[],
    duration_ms: number,
  ): DeliveryScoreResult {
    const pace = measureSpeakingPace(words, duration_ms);
    const fillers = detectFillers(transcript_text);
    const sentence_resolution = measureSentenceResolution(transcript_text);

    const pauses = classifyPauses(words);
    const pause_placement = this.summarisePausePlacement(pauses, words);

    const scored_verdicts = [fillers.verdict, sentence_resolution.verdict];
    if (pace.is_measurable) scored_verdicts.push(pace.verdict);
    if (pause_placement.is_measurable) {
      scored_verdicts.push(pause_placement.verdict);
    }

    const overall_score = Math.round(
      scored_verdicts.reduce(
        (total, verdict) => total + VERDICT_POINTS[verdict],
        0,
      ) / scored_verdicts.length,
    );

    return {
      pace,
      pause_placement,
      fillers,
      sentence_resolution,
      overall_score,
      coaching_notes: this.buildCoachingNotes(
        pace,
        fillers,
        sentence_resolution,
        pauses,
      ),
      not_scored_by_design: NOT_SCORED_BY_DESIGN,
    };
  }

  private summarisePausePlacement(
    pauses: ClassifiedPause[],
    words: TranscriptWord[],
  ): PausePlacementSummary {
    const is_measurable =
      words.length > 1 && words.every((word) => word.has_reliable_timing);

    if (!is_measurable) {
      return {
        structural_count: 0,
        word_retrieval_count: 0,
        verdict: MetricVerdict.WATCH,
        is_measurable: false,
      };
    }

    const structural_count = pauses.filter(
      (pause) => pause.kind === PauseKind.STRUCTURAL,
    ).length;

    const coachable_retrieval_pauses = pauses.filter(
      (pause) =>
        pause.kind === PauseKind.WORD_RETRIEVAL &&
        pause.duration_ms >= COACHABLE_RETRIEVAL_PAUSE_MS,
    );

    return {
      structural_count,
      word_retrieval_count: coachable_retrieval_pauses.length,
      verdict: this.classifyPausePlacement(coachable_retrieval_pauses.length),
      is_measurable: true,
    };
  }

  private classifyPausePlacement(coachable_pause_count: number): MetricVerdict {
    if (coachable_pause_count <= 1) return MetricVerdict.GOOD;
    if (coachable_pause_count <= 3) return MetricVerdict.WATCH;
    return MetricVerdict.POOR;
  }

  private buildCoachingNotes(
    pace: SpeakingPaceSummary,
    fillers: FillerSummary,
    sentence_resolution: SentenceResolutionSummary,
    pauses: ClassifiedPause[],
  ): DeliveryCoachingNote[] {
    const notes: DeliveryCoachingNote[] = [];

    if (pace.is_measurable && pace.verdict !== MetricVerdict.GOOD) {
      const is_too_fast = pace.words_per_minute > 165;

      notes.push({
        about: `Pace ${pace.words_per_minute} wpm`,
        suggestion: is_too_fast
          ? 'Land a full stop after each STAR stage. The interviewer needs the beat more than you need the time.'
          : 'Cut the run-up and open on the decision. You are spending words before the story starts.',
      });
    }

    const coachable_retrieval_pauses = pauses.filter(
      (pause) =>
        pause.kind === PauseKind.WORD_RETRIEVAL &&
        pause.duration_ms >= COACHABLE_RETRIEVAL_PAUSE_MS,
    );

    coachable_retrieval_pauses.slice(0, 3).forEach((pause, index) => {
      notes.push({
        about: `${(pause.duration_ms / 1000).toFixed(1)}s pause before "${pause.word_after}"`,
        suggestion: `Reaching for a word is not a problem — stopping is. Bridge with "${suggestBridgePhrase(index)}" and keep the sentence alive.`,
      });
    });

    if (fillers.verdict !== MetricVerdict.GOOD) {
      notes.push({
        about: `${fillers.fillers_per_hundred_words} fillers per 100 words`,
        suggestion:
          'Replace the filler with silence. A half-second of nothing reads as composure; "basically" reads as padding.',
      });
    }

    if (sentence_resolution.verdict !== MetricVerdict.GOOD) {
      const example = sentence_resolution.unresolved_fragments[0];

      notes.push({
        about: `${sentence_resolution.unresolved_count} sentences did not land`,
        suggestion: example
          ? `Finish the thought before starting the next one — "${example.slice(0, 70)}…" trails off.`
          : 'Finish each thought before starting the next one.',
      });
    }

    return notes;
  }
}
