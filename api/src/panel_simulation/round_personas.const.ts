import { QuestionCategory } from '../question_library/question_category.enum';
import { InterviewRound } from './interview_round.enum';

/**
 * The three rounds, and who is in the room for each.
 *
 * The recruiter round opens on logistics and work authorisation because in the
 * real world it does — which is the whole reason the sponsorship drill is not a
 * side feature.
 */

export interface RoundPersona {
  round: InterviewRound;
  title: string;
  interviewer_role: string;
  /** What this interviewer is actually deciding. */
  what_they_are_deciding: string;
  /** Seconds before this persona starts losing patience with an answer. */
  rambling_tolerance_seconds: number;
  /** Categories this round draws from when the model has not planned it. */
  question_categories: QuestionCategory[];
  /** Asked first, in this order, regardless of what else is planned. */
  opening_question_ids: string[];
}

export const ROUND_PERSONAS: RoundPersona[] = [
  {
    round: InterviewRound.RECRUITER_SCREEN,
    title: 'Recruiter screen',
    interviewer_role:
      'A recruiter with twelve of these calls booked today. Friendly, fast, and working through a checklist.',
    what_they_are_deciding:
      "Whether you are worth the hiring manager's hour. Logistics can end this round on their own.",
    rambling_tolerance_seconds: 75,
    question_categories: [
      QuestionCategory.OPENER,
      QuestionCategory.LOGISTICS,
      QuestionCategory.MOTIVATION,
    ],
    // Work authorisation comes up here, first, exactly as it does in the real one.
    opening_question_ids: [
      'tell-me-about-yourself',
      'sponsorship-requirement',
      'why-this-company',
    ],
  },
  {
    round: InterviewRound.HIRING_MANAGER,
    title: 'Hiring manager',
    interviewer_role:
      'The person who will manage you. Listening for judgement and for whether you are expensive to supervise.',
    what_they_are_deciding:
      'Whether you can do the work without being told how, and whether feedback reaches you.',
    rambling_tolerance_seconds: 150,
    question_categories: [
      QuestionCategory.LEADERSHIP,
      QuestionCategory.FAILURE,
      QuestionCategory.PROBLEM_SOLVING,
    ],
    opening_question_ids: ['why-this-role', 'time-you-failed'],
  },
  {
    round: InterviewRound.PEER_PANEL,
    title: 'Peer panel',
    interviewer_role:
      'Two people who would work beside you. Less polished, more specific, and unimpressed by rehearsed answers.',
    what_they_are_deciding:
      'Whether they want you in their standup, and whether your stories survive follow-up questions.',
    rambling_tolerance_seconds: 120,
    question_categories: [
      QuestionCategory.CONFLICT,
      QuestionCategory.TEAMWORK,
      QuestionCategory.INITIATIVE,
    ],
    opening_question_ids: [
      'disagreed-with-teammate',
      'worked-with-different-culture',
    ],
  },
];

export function findRoundPersona(round_key: string): RoundPersona | null {
  return ROUND_PERSONAS.find((persona) => persona.round === round_key) ?? null;
}
