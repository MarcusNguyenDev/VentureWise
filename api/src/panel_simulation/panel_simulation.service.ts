import { Inject, Injectable } from '@nestjs/common';

import { AI_COACH_PORT, AiCoachPort } from '../ai_coach/ai_coach.contract';
import { BehaviouralQuestion } from '../question_library/behavioural_question.entity';
import { QuestionLibraryService } from '../question_library/question_library.service';
import { SessionStoreService } from '../session_management/session_store.service';
import { InterviewRound } from './interview_round.enum';
import { ROUND_PERSONAS, RoundPersona } from './round_personas.const';

/**
 * F-06: resume plus job posting in, a three-round process out.
 *
 * The round structure, the personas and the opening questions are fixed and
 * deterministic, so a plan always renders. Only the gap analysis and the
 * posting-specific questions cross the AI boundary — when those are stubbed the
 * round falls back to the hand-written library and says so.
 */

export interface PlannedRound {
  round: InterviewRound;
  title: string;
  interviewer_role: string;
  what_they_are_deciding: string;
  rambling_tolerance_seconds: number;
  questions: PlannedRoundQuestion[];
}

export interface PlannedRoundQuestion {
  question_id: string | null;
  question_text: string;
  /** Set when the question was derived from a specific posting requirement. */
  targets_requirement: string | null;
  /** True for hand-written library questions, false for generated ones. */
  is_from_library: boolean;
}

export interface InterviewPlan {
  session_id: string;
  employer_name: string | null;
  coverage_gaps: string[];
  rounds: PlannedRound[];
  /** True when the gap analysis and generated questions came from fixtures. */
  is_stubbed: boolean;
}

@Injectable()
export class PanelSimulationService {
  constructor(
    private readonly session_store_service: SessionStoreService,
    private readonly question_library_service: QuestionLibraryService,
    @Inject(AI_COACH_PORT) private readonly ai_coach: AiCoachPort,
  ) {}

  async buildPlan(session_id: string): Promise<InterviewPlan> {
    const session = await this.session_store_service.get(session_id);

    const plan_from_model = await this.ai_coach.buildInterviewPlan({
      resume_text: session.resume_text,
      job_posting_text: session.job_posting_text,
      employer_name: session.employer_name,
    });

    return {
      session_id,
      employer_name: session.employer_name,
      coverage_gaps: plan_from_model.coverage_gaps,
      rounds: ROUND_PERSONAS.map((persona) =>
        this.buildRound(persona, plan_from_model),
      ),
      is_stubbed: plan_from_model.is_stubbed,
    };
  }

  private buildRound(
    persona: RoundPersona,
    plan_from_model: { rounds: { round_key: string; questions: { question_text: string; targets_requirement: string }[] }[] },
  ): PlannedRound {
    const opening_questions = persona.opening_question_ids
      .map((question_id) => this.question_library_service.findQuestion(question_id))
      .filter((question): question is BehaviouralQuestion => question !== null)
      .map((question) => this.toPlannedQuestion(question));

    const generated_questions =
      plan_from_model.rounds
        .find((round) => round.round_key === persona.round)
        ?.questions.map((question) => ({
          question_id: null,
          question_text: question.question_text,
          targets_requirement: question.targets_requirement,
          is_from_library: false,
        })) ?? [];

    // With no model wired in there are no generated questions, so the round is
    // filled out from the library rather than rendering half empty.
    const filler_questions =
      generated_questions.length > 0
        ? []
        : this.pickLibraryFiller(persona, opening_questions);

    return {
      round: persona.round,
      title: persona.title,
      interviewer_role: persona.interviewer_role,
      what_they_are_deciding: persona.what_they_are_deciding,
      rambling_tolerance_seconds: persona.rambling_tolerance_seconds,
      questions: [
        ...opening_questions,
        ...generated_questions,
        ...filler_questions,
      ],
    };
  }

  private pickLibraryFiller(
    persona: RoundPersona,
    already_planned: PlannedRoundQuestion[],
  ): PlannedRoundQuestion[] {
    const QUESTIONS_PER_ROUND = 4;
    const already_planned_ids = new Set(
      already_planned.map((question) => question.question_id),
    );

    return persona.question_categories
      .flatMap((category) =>
        this.question_library_service.listQuestions(category),
      )
      .filter((question) => !already_planned_ids.has(question.question_id))
      .slice(0, Math.max(QUESTIONS_PER_ROUND - already_planned.length, 0))
      .map((question) => this.toPlannedQuestion(question));
  }

  private toPlannedQuestion(
    question: BehaviouralQuestion,
  ): PlannedRoundQuestion {
    return {
      question_id: question.question_id,
      question_text: question.question_text,
      targets_requirement: null,
      is_from_library: true,
    };
  }
}
