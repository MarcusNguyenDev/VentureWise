/**
 * The shapes the API returns.
 *
 * Mirrors the DTOs and entities in `api/src/`. Kept as plain types rather than
 * a generated client because the two projects have separate dependency trees
 * inside their own dev containers, and a build step between them costs more
 * than it saves at this size.
 */

export type MetricVerdict = "GOOD" | "WATCH" | "POOR";

export type StarStage = "SITUATION" | "TASK" | "ACTION" | "RESULT";

export const STAR_STAGE_ORDER: StarStage[] = [
  "SITUATION",
  "TASK",
  "ACTION",
  "RESULT",
];

export type QuestionCategory =
  | "OPENER"
  | "CONFLICT"
  | "FAILURE"
  | "LEADERSHIP"
  | "TEAMWORK"
  | "INITIATIVE"
  | "PROBLEM_SOLVING"
  | "MOTIVATION"
  | "LOGISTICS";

export interface BehaviouralQuestion {
  question_id: string;
  question_text: string;
  category: QuestionCategory;
  interviewer_intent: string;
  what_lands: string[];
  common_mistake: string;
  intercultural_note: string | null;
  target_seconds: number;
}

export interface TranscriptWord {
  text: string;
  start_ms: number;
  end_ms: number;
  has_reliable_timing: boolean;
}

export interface PronounMention {
  token: string;
  attribution: "FIRST_PERSON" | "COLLECTIVE";
  char_start: number;
  char_end: number;
  is_verb_attached: boolean;
  attached_verb: string | null;
}

export interface PronounAttributionSummary {
  first_person_count: number;
  collective_count: number;
  ratio_label: string;
  verdict: MetricVerdict;
  mentions: PronounMention[];
}

export interface PracticeSession {
  session_id: string;
  created_at_ms: number;
  resume_text: string;
  job_posting_text: string;
  employer_name: string | null;
  attempts: AnswerAttempt[];
}

export interface AnswerAttempt {
  attempt_id: string;
  question_id: string;
  question_text: string;
  take_number: number;
  started_at_ms: number;
  ended_at_ms: number | null;
  current_nudge_text: string | null;
}

export interface TrackAnswerProgressResult {
  is_stubbed: boolean;
  current_stage: StarStage;
  stage_durations_seconds: Partial<Record<StarStage, number>>;
  has_quantified_result: boolean;
  nudge_text: string | null;
}

export interface AnswerProgress {
  metrics: {
    pronoun_attribution: PronounAttributionSummary;
    pace: { words_per_minute: number; verdict: MetricVerdict; is_measurable: boolean };
    hedges: { hedge_count: number; verdict: MetricVerdict };
    fillers: { filler_count: number; fillers_per_hundred_words: number; verdict: MetricVerdict };
  };
  progress: TrackAnswerProgressResult;
  active_nudge_text: string | null;
}

export type DiffOperation = "EQUAL" | "REMOVED" | "ADDED";

export interface DiffSegment {
  operation: DiffOperation;
  text: string;
}

export interface UntranslatedPhrase {
  phrase: string;
  why_it_does_not_travel: string;
  suggested_replacement: string;
  char_start: number;
  char_end: number;
}

export interface DeliveryCoachingNote {
  about: string;
  suggestion: string;
}

export interface DeliveryScoreResult {
  pace: { words_per_minute: number; verdict: MetricVerdict; is_measurable: boolean };
  pause_placement: {
    structural_count: number;
    word_retrieval_count: number;
    verdict: MetricVerdict;
    is_measurable: boolean;
  };
  fillers: { filler_count: number; fillers_per_hundred_words: number; verdict: MetricVerdict };
  sentence_resolution: {
    sentence_count: number;
    unresolved_count: number;
    resolution_rate: number;
    verdict: MetricVerdict;
    unresolved_fragments: string[];
  };
  overall_score: number;
  coaching_notes: DeliveryCoachingNote[];
  not_scored_by_design: string[];
}

export interface AnswerReview {
  attempt_id: string;
  question_text: string;
  transcript_text: string;
  duration_seconds: number;
  pronoun_attribution: PronounAttributionSummary;
  rewrite_diff: DiffSegment[];
  reclaimed_verb_count: number;
  critique: {
    is_stubbed: boolean;
    first_person_rewrite: string;
    length_variants: { target_seconds: number; answer_text: string }[];
    strengths: string[];
    fixes: string[];
  };
  subtext: {
    is_stubbed: boolean;
    interviewer_intent: string;
    what_lands: string[];
    untranslated_phrases: {
      phrase: string;
      why_it_does_not_travel: string;
      suggested_replacement: string;
    }[];
  };
  delivery: DeliveryScoreResult;
  untranslated_phrases: UntranslatedPhrase[];
  is_partially_stubbed: boolean;
}

export type VisaStatus =
  | "STUDENT_500_STUDYING"
  | "STUDENT_500_COMPLETED"
  | "GRADUATE_485_POST_HIGHER_EDUCATION"
  | "GRADUATE_485_POST_VOCATIONAL"
  | "SKILLS_IN_DEMAND_482"
  | "BRIDGING_VISA"
  | "PERMANENT_WORK_RIGHTS";

export type QualificationLevel =
  | "VOCATIONAL"
  | "BACHELOR"
  | "MASTERS_COURSEWORK"
  | "MASTERS_RESEARCH"
  | "DOCTORAL";

export interface WorkAuthorisationTimeline {
  requires_future_sponsorship: boolean;
  total_authorised_months: number;
  remaining_authorised_months: number;
  authorisation_start_date: string | null;
  authorisation_end_date: string | null;
  duration_phrase: string;
  regional_extension_months: number | null;
  is_capped_to_part_time: boolean;
  hours_per_fortnight_cap: number | null;
  next_sponsorship_pathway: string | null;
  summary_line: string;
}

export interface SponsorshipBriefing {
  timeline: WorkAuthorisationTimeline;
  answer: {
    answer_text: string;
    sentences: string[];
    estimated_spoken_seconds: number;
    must_verify_before_use: boolean;
    cited_employer: {
      employer_name: string;
      is_approved_sponsor: boolean | null;
      is_accredited_sponsor: boolean | null;
      recent_nomination_count: number | null;
      nomination_data_year: number | null;
      is_verified: boolean;
    } | null;
  };
  disclaimer: string;
}

export interface SponsorshipDrillScore {
  spoken_seconds: number;
  is_within_time: boolean;
  is_direct_opening: boolean;
  has_dates: boolean;
  apology_matches: { phrase: string; char_start: number; char_end: number }[];
  hedge_count: number;
  is_passing: boolean;
  coaching_notes: string[];
}

export interface Story {
  story_id: string;
  title: string;
  detected_language: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  themes: string[];
  created_at_ms: number;
  is_stubbed: boolean;
}

export interface RecallDrillCard {
  question_id: string;
  question_text: string;
  story_options: { story_id: string; title: string }[];
  matching_story_ids: string[];
  seconds_allowed: number;
}

export interface PlannedRoundQuestion {
  question_id: string | null;
  question_text: string;
  targets_requirement: string | null;
  is_from_library: boolean;
}

export interface PlannedRound {
  round: "RECRUITER_SCREEN" | "HIRING_MANAGER" | "PEER_PANEL";
  title: string;
  interviewer_role: string;
  what_they_are_deciding: string;
  rambling_tolerance_seconds: number;
  questions: PlannedRoundQuestion[];
}

export interface InterviewPlan {
  session_id: string;
  employer_name: string | null;
  coverage_gaps: string[];
  rounds: PlannedRound[];
  is_stubbed: boolean;
}

export interface ServiceHealth {
  service_name: string;
  is_healthy: boolean;
  ai_coach_provider: string;
}
