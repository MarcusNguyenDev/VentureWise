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
import {
  classifyPace,
  measureSpeakingPace,
  SpeakingPaceSummary,
} from './speaking_pace.util';
import { TranscriptWord } from './transcript_word.type';

/**
 * F-05, the accent-fair delivery score.
 *
 * Four things get scored, and the list of things deliberately left unscored is
 * part of the response rather than a footnote in marketing copy — the UI is
 * expected to render it.
 */

/**
 * Published in the UI. Changing this list is a product decision, not a tweak.
 *
 * The camera feature added a composure reading built partly from face
 * tracking. That reading is deliberately kept OUT of this score and is labelled
 * "not scored" wherever it appears, so these promises still hold literally.
 * If composure is ever folded into the delivery score, the last two lines here
 * become false and must be removed rather than quietly left in place.
 */
export const NOT_SCORED_BY_DESIGN: string[] = [
  'Accent',
  'Pronunciation',
  'Vocabulary sophistication',
  'Grammar typical of a second-language speaker',
  '"Confidence" inferred from voice or face',
  'Eye contact, or how much you look at the camera',
];

export interface DeliveryCoachingNote {
  about: string;
  suggestion: string;
}

export interface PausePlacementSummary {
  structural_count: number;
  word_retrieval_count: number;
  verdict: MetricVerdict;
  /** False when neither audio analysis nor word timings were available. */
  is_measurable: boolean;
}

/**
 * Measurements taken from the microphone signal in the browser.
 *
 * When present these REPLACE the text-derived filler and pause figures rather
 * than supplementing them. The recogniser deletes filled pauses and supplies
 * no timings, so the text versions were structurally unable to see either —
 * a real measurement beats a proxy that reads zero by construction.
 */
export interface AudioDeliveryMeasurements {
  pause_count: number;
  long_pause_count: number;
  longest_pause_ms: number;
  filled_pause_count: number;
  filled_pauses_per_minute: number;
  articulation_rate_wpm: number;
  speaking_ratio: number;
}

export interface DeliveryScoreResult {
  pace: SpeakingPaceSummary;
  pause_placement: PausePlacementSummary;
  fillers: FillerSummary;
  sentence_resolution: SentenceResolutionSummary;
  /**
   * 0-100, or null when there was not enough speech to judge.
   *
   * Null rather than zero: an unanswered question has no delivery quality, and
   * a zero would read as "you delivered it terribly" rather than "there is
   * nothing here to score".
   */
  overall_score: number | null;
  is_scorable: boolean;
  /** Why the score is missing, when it is. */
  not_scorable_reason: string | null;
  word_count: number;
  coaching_notes: DeliveryCoachingNote[];
  not_scored_by_design: string[];
}

/**
 * Harsher than a naive linear scale on purpose. A "watch" is a real problem an
 * interviewer would notice, not a near miss, so it should not average out to a
 * comfortable mark.
 */
const VERDICT_POINTS: Record<MetricVerdict, number> = {
  [MetricVerdict.GOOD]: 100,
  [MetricVerdict.WATCH]: 55,
  [MetricVerdict.POOR]: 20,
};

/**
 * Below this there is nothing to judge.
 *
 * Silence used to score 100 out of 100: with no words, filler density is zero
 * and every sentence trivially resolves, so both measurable components read
 * GOOD. The bug was scoring the absence of evidence as evidence of quality.
 */
const MINIMUM_WORDS_FOR_A_SCORE = 11;

/**
 * An answer this short is not a behavioural answer, however cleanly delivered.
 * It can still be scored, but it cannot be scored well.
 */
const THIN_ANSWER_WORDS = 40;
const THIN_ANSWER_CEILING = 60;

/**
 * Without word timings only two of the four components can be measured, and a
 * perfect mark on half a rubric is not a perfect mark.
 */
const PARTIAL_EVIDENCE_CEILING = 85;

@Injectable()
export class DeliveryScoreService {
  scoreDelivery(
    transcript_text: string,
    words: TranscriptWord[],
    duration_ms: number,
    audio: AudioDeliveryMeasurements | null = null,
  ): DeliveryScoreResult {
    const pace = this.measurePace(words, duration_ms, audio);
    const fillers = this.measureFillers(transcript_text, audio);
    const sentence_resolution = measureSentenceResolution(transcript_text);

    const pauses = classifyPauses(words);
    const pause_placement = audio
      ? this.summariseMeasuredPauses(audio)
      : this.summarisePausePlacement(pauses, words);

    const word_count = (transcript_text.match(/\S+/g) ?? []).length;

    const scored_verdicts = [fillers.verdict, sentence_resolution.verdict];
    if (pace.is_measurable) scored_verdicts.push(pace.verdict);
    if (pause_placement.is_measurable) {
      scored_verdicts.push(pause_placement.verdict);
    }

    const is_scorable = word_count >= MINIMUM_WORDS_FOR_A_SCORE;

    return {
      pace,
      pause_placement,
      fillers,
      sentence_resolution,
      word_count,
      is_scorable,
      not_scorable_reason: is_scorable
        ? null
        : word_count === 0
          ? 'Nothing was said, so there is no delivery to score.'
          : `Only ${word_count} word${word_count === 1 ? '' : 's'}. At least ${MINIMUM_WORDS_FOR_A_SCORE} are needed before any of this means anything.`,
      overall_score: is_scorable
        ? this.calculateOverallScore(
            scored_verdicts,
            word_count,
            pace.is_measurable && pause_placement.is_measurable,
          )
        : null,
      coaching_notes: is_scorable
        ? this.buildCoachingNotes(pace, fillers, sentence_resolution, pauses)
        : [],
      not_scored_by_design: NOT_SCORED_BY_DESIGN,
    };
  }

  /**
   * The mean of the measured components, then capped by how much was actually
   * measured and by whether the answer had any substance.
   */
  private calculateOverallScore(
    scored_verdicts: MetricVerdict[],
    word_count: number,
    has_full_evidence: boolean,
  ): number {
    const mean_score =
      scored_verdicts.reduce(
        (total, verdict) => total + VERDICT_POINTS[verdict],
        0,
      ) / scored_verdicts.length;

    const ceilings = [100];
    if (!has_full_evidence) ceilings.push(PARTIAL_EVIDENCE_CEILING);
    if (word_count < THIN_ANSWER_WORDS) ceilings.push(THIN_ANSWER_CEILING);

    return Math.round(Math.min(mean_score, ...ceilings));
  }

  /**
   * Articulation rate when the audio supplies it — words divided by time spent
   * speaking rather than by wall clock, so thinking silence no longer reads as
   * talking slowly.
   */
  private measurePace(
    words: TranscriptWord[],
    duration_ms: number,
    audio: AudioDeliveryMeasurements | null,
  ): SpeakingPaceSummary {
    if (!audio) return measureSpeakingPace(words, duration_ms);

    return {
      words_per_minute: audio.articulation_rate_wpm,
      verdict: classifyPace(audio.articulation_rate_wpm),
      is_measurable: true,
    };
  }

  /**
   * Acoustic filled pauses where available.
   *
   * Both are reported per hundred words so the existing bands still apply, but
   * the acoustic count is the one that reflects reality — the text count is
   * near zero on the microphone path no matter how somebody spoke.
   */
  private measureFillers(
    transcript_text: string,
    audio: AudioDeliveryMeasurements | null,
  ): FillerSummary {
    const from_text = detectFillers(transcript_text);
    if (!audio) return from_text;

    const word_count = (transcript_text.match(/\S+/g) ?? []).length;
    if (word_count === 0) return from_text;

    // Lexical fillers the recogniser did keep ("like", "basically") still
    // count; they are a different habit from a filled pause.
    const combined_count = audio.filled_pause_count + from_text.filler_count;
    const per_hundred_words = Number(
      ((combined_count / word_count) * 100).toFixed(1),
    );

    return {
      filler_count: combined_count,
      fillers_per_hundred_words: per_hundred_words,
      verdict:
        per_hundred_words <= 2
          ? MetricVerdict.GOOD
          : per_hundred_words <= 5
            ? MetricVerdict.WATCH
            : MetricVerdict.POOR,
    };
  }

  private summariseMeasuredPauses(
    audio: AudioDeliveryMeasurements,
  ): PausePlacementSummary {
    return {
      structural_count: audio.pause_count - audio.long_pause_count,
      word_retrieval_count: audio.long_pause_count,
      verdict: this.classifyPausePlacement(audio.long_pause_count),
      is_measurable: true,
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
