import { Injectable } from '@nestjs/common';

import { detectFillers, FillerSummary } from './filler_detection.util';
import { detectHedges, HedgeSummary } from './hedge_detection.util';
import {
  analysePronounAttribution,
  PronounAttributionSummary,
} from './pronoun_attribution.util';
import { measureSpeakingPace, SpeakingPaceSummary } from './speaking_pace.util';
import { TranscriptWord } from './transcript_word.type';

/**
 * The fast-loop metrics, computed server side.
 *
 * The browser runs the same maths locally so the meter moves with no network in
 * the path (see `front-end/lib/fast_loop/`). This service exists so the slow
 * loop, the sponsorship drill and any replayed transcript all get the same
 * numbers without trusting a client that could be out of date.
 */

export interface LiveMetricsSnapshot {
  pronoun_attribution: PronounAttributionSummary;
  pace: SpeakingPaceSummary;
  hedges: HedgeSummary;
  fillers: FillerSummary;
}

@Injectable()
export class SpeechAnalysisService {
  analyseTranscript(
    transcript_text: string,
    words: TranscriptWord[],
    elapsed_ms: number,
  ): LiveMetricsSnapshot {
    return {
      pronoun_attribution: analysePronounAttribution(transcript_text),
      pace: measureSpeakingPace(words, elapsed_ms),
      hedges: detectHedges(transcript_text),
      fillers: detectFillers(transcript_text),
    };
  }
}
