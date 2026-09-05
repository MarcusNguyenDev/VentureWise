import { StarStage } from '../shared/types/star_stage.enum';

/**
 * Every input and output that crosses the AI boundary.
 *
 * Nothing in this file mentions a vendor, a model name or a prompt. The rest of
 * the application depends only on these shapes, so swapping the provider is a
 * one-file change.
 */

/** Present on every result so the UI can label fixture output honestly. */
export interface StubbableResult {
  /**
   * True when the value came from fixtures rather than a model — including
   * when a model call timed out and a deterministic fallback was used, so the
   * UI never presents a fallback as a real critique.
   */
  is_stubbed: boolean;
}

/**
 * The candidate's resume and target posting, pre-rendered as one block.
 *
 * Carried explicitly rather than fetched inside the provider because it is the
 * cached prompt prefix: it is identical for every call in a session, so putting
 * it first lets the provider bill most of its input at the cached rate. It also
 * has to clear 1024 tokens for caching to engage at all.
 */
export interface CandidateContext {
  resume_text: string;
  job_posting_text: string;
  employer_name: string | null;
}

/* -------------------------------------------------------------------------- */
/* Mid loop — runs every 6-8 seconds of speech while the candidate is talking. */
/* -------------------------------------------------------------------------- */

export interface TrackAnswerProgressInput {
  /** The cached prompt prefix. Null when the session has no resume yet. */
  candidate_context: CandidateContext | null;
  question_text: string;
  /** Everything said so far in this answer. */
  transcript_text: string;
  seconds_elapsed: number;
  /** Emitted by the browser fast loop, so the model need not recount. */
  first_person_count: number;
  collective_count: number;
  /** The nudge already on screen, so the model can decline to replace it. */
  current_nudge_text: string | null;
}

export interface TrackAnswerProgressResult extends StubbableResult {
  current_stage: StarStage;
  /** Seconds spent in each stage so far; absent stages have not been reached. */
  stage_durations_seconds: Partial<Record<StarStage, number>>;
  has_quantified_result: boolean;
  /**
   * At most one nudge, or null to leave the slot alone. The spec is explicit
   * that competing nudges are what makes this feel broken.
   */
  nudge_text: string | null;
}

/* -------------------------------------------------------------------------- */
/* Slow loop — runs once, after the candidate stops speaking.                  */
/* -------------------------------------------------------------------------- */

export interface CritiqueAnswerInput {
  /** The cached prompt prefix. Null when the session has no resume yet. */
  candidate_context: CandidateContext | null;
  question_text: string;
  transcript_text: string;
  duration_seconds: number;
}

export interface CritiqueAnswerResult extends StubbableResult {
  /**
   * The same story told in first person. The word-level diff against the
   * original is computed deterministically in `answer_diff.util.ts` — the model
   * is not asked to produce diff markup.
   */
  first_person_rewrite: string;
  /** The same answer compressed to three lengths, keyed by target seconds. */
  length_variants: AnswerLengthVariant[];
  strengths: string[];
  fixes: string[];
}

export interface AnswerLengthVariant {
  target_seconds: number;
  answer_text: string;
}

export interface DecodeSubtextInput {
  /** The cached prompt prefix. Null when the session has no resume yet. */
  candidate_context: CandidateContext | null;
  question_text: string;
  /** Hand-written intent for this question, when the library has one. */
  known_question_intent: string | null;
  transcript_text: string;
  /**
   * Phrases the deterministic lexicon already flagged, so the model explains
   * rather than re-detects.
   */
  flagged_phrases: string[];
}

export interface DecodeSubtextResult extends StubbableResult {
  /** What the interviewer is actually testing with this question. */
  interviewer_intent: string;
  /** What a strong answer must contain for this question. */
  what_lands: string[];
  /** Phrases a US interviewer will not decode, with a plain-English swap. */
  untranslated_phrases: UntranslatedPhrase[];
}

export interface UntranslatedPhrase {
  phrase: string;
  why_it_does_not_travel: string;
  suggested_replacement: string;
}

/* -------------------------------------------------------------------------- */
/* F-04 — story bank in the candidate's first language.                       */
/* -------------------------------------------------------------------------- */

export interface ExtractStoryInput {
  /** A messy memory, in any language, typed or transcribed from a voice note. */
  raw_memory_text: string;
  /** BCP-47 tag when the client knows it; the model detects it otherwise. */
  source_language: string | null;
}

export interface ExtractStoryResult extends StubbableResult {
  title: string;
  detected_language: string;
  /** Specifics — names, numbers, tools — are preserved, not paraphrased. */
  situation: string;
  task: string;
  action: string;
  result: string;
  /** Behavioural themes this story can answer, for the recall drill. */
  themes: string[];
}

/* -------------------------------------------------------------------------- */
/* F-06 — panel simulation built from a resume and a job posting.             */
/* -------------------------------------------------------------------------- */

export interface BuildInterviewPlanInput {
  resume_text: string;
  job_posting_text: string;
  employer_name: string | null;
}

export interface BuildInterviewPlanResult extends StubbableResult {
  /** Requirements in the posting the resume does not evidence. */
  coverage_gaps: string[];
  rounds: PlannedInterviewRound[];
}

export interface PlannedInterviewRound {
  round_key: string;
  questions: PlannedQuestion[];
}

export interface PlannedQuestion {
  question_text: string;
  /** Which posting requirement this question probes. */
  targets_requirement: string;
}

/* -------------------------------------------------------------------------- */

/**
 * The single interface the application depends on for model-backed judgement.
 *
 * Implementations live in `providers/`. Inject it with the `AI_COACH_PORT`
 * token — never import a provider class directly.
 */
export interface AiCoachPort {
  trackAnswerProgress(
    input: TrackAnswerProgressInput,
  ): Promise<TrackAnswerProgressResult>;

  critiqueAnswer(input: CritiqueAnswerInput): Promise<CritiqueAnswerResult>;

  decodeSubtext(input: DecodeSubtextInput): Promise<DecodeSubtextResult>;

  extractStoryFromMemory(input: ExtractStoryInput): Promise<ExtractStoryResult>;

  buildInterviewPlan(
    input: BuildInterviewPlanInput,
  ): Promise<BuildInterviewPlanResult>;
}

export const AI_COACH_PORT = Symbol('AI_COACH_PORT');
