import type { TranscriptWord } from "../api/api_contracts";

/**
 * The H+06 insurance from Part 6 of the spec: if the mic dies, replay a
 * transcript instead and keep the demo running.
 *
 * The canned words carry real timings, so the replay actually exercises F-05's
 * pause metrics — which the browser Web Speech API cannot. `[[pause:1200]]`
 * inserts a silence of that many milliseconds.
 */

export interface CannedTranscript {
  key: string;
  label: string;
  question_id: string;
  /** Shown in the picker so the demo driver knows which take this is. */
  description: string;
  script: string;
}

export const CANNED_TRANSCRIPTS: CannedTranscript[] = [
  {
    key: "disagreement-take-one",
    label: "Take one — the way people actually answer",
    question_id: "disagreed-with-teammate",
    description:
      "Six collective verbs, two hedges, no result. The I/We meter goes red and stays there.",
    script:
      "So in my final year project, we had a team of five [[pause:700]] and we were building a load forecasting model for the campus grid. " +
      "I was kind of responsible for the data pipeline, and we disagreed about whether to drop the sensor [[pause:1400]] outliers. " +
      "Maybe I could say that we discussed it for a while [[pause:900]] and then we decided to keep them.",
  },
  {
    key: "disagreement-take-two",
    label: "Take two — after the rewrite",
    question_id: "disagreed-with-teammate",
    description:
      "The same story, verbs reclaimed, landing on a number. Ten seconds is enough to make the point.",
    script:
      "I owned the data pipeline on my capstone project. " +
      "I argued we should keep the sensor outliers, so I ran the model both ways. " +
      "As a result I showed forecast error dropped 12 percent when we kept them, and I made that call.",
  },
];

/** Unhurried spoken English, close enough that the pace meter reads sensibly. */
const MILLISECONDS_PER_WORD = 380;
const PAUSE_MARKER_PATTERN = /^\[\[pause:(\d+)\]\]$/;

export interface CannedWord extends TranscriptWord {
  /** True when a deliberate silence precedes this word. */
  follows_pause: boolean;
}

/** Expands a script into timed words, resolving the pause markers. */
export function buildCannedWords(script: string): CannedWord[] {
  const tokens = script.split(/\s+/).filter((token) => token.length > 0);
  const words: CannedWord[] = [];

  let current_ms = 0;
  let pending_pause_ms = 0;

  for (const token of tokens) {
    const pause_match = token.match(PAUSE_MARKER_PATTERN);

    if (pause_match) {
      pending_pause_ms = Number(pause_match[1]);
      continue;
    }

    current_ms += pending_pause_ms;

    words.push({
      text: token,
      start_ms: current_ms,
      end_ms: current_ms + MILLISECONDS_PER_WORD,
      // The replay knows exactly when each word was spoken, so unlike the Web
      // Speech API it can honestly claim reliable timings.
      has_reliable_timing: true,
      follows_pause: pending_pause_ms > 0,
    });

    current_ms += MILLISECONDS_PER_WORD;
    pending_pause_ms = 0;
  }

  return words;
}

export function findCannedTranscript(key: string): CannedTranscript | null {
  return CANNED_TRANSCRIPTS.find((transcript) => transcript.key === key) ?? null;
}
