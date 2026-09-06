import { Inject, Injectable } from '@nestjs/common';

import {
  AI_COACH_PORT,
  AiCoachPort,
  ReviewResumeResult,
} from '../ai_coach/ai_coach.contract';
import {
  CvConventionFinding,
  detectCvConventionIssues,
} from './australian_cv_conventions.util';
import { ReviewResumeRequestDto } from './dto/review_resume.dto';
import {
  buildResumeWritingReport,
  ResumeWritingReport,
} from './resume_writing_checks.util';

/**
 * Comprehensive CV review.
 *
 * Most of it is deterministic. The Australian convention breaches, the weak
 * openers, the unevidenced claims and the quantification ratio are all exactly
 * computable, and computing them is both cheaper and more reliable than asking
 * a model to notice them. The model is given what was already found and spends
 * its attention on the one thing it is actually better at: rewriting a weak
 * bullet without inventing a number.
 */

export interface ResumeReview {
  conventions: CvConventionFinding[];
  writing: ResumeWritingReport;
  /** Deterministic headline notes, ordered by how much they cost the reader. */
  priorities: string[];
  critique: ReviewResumeResult;
  is_partially_stubbed: boolean;
}

/** Below this share of quantified bullets, a CV reads as a duty list. */
const HEALTHY_QUANTIFIED_RATIO = 0.4;

/** Australian CVs run to two or three pages; one is usually under-selling. */
const SHORT_CV_PAGES = 1;
const LONG_CV_PAGES = 4;

@Injectable()
export class ResumeReviewService {
  constructor(@Inject(AI_COACH_PORT) private readonly ai_coach: AiCoachPort) {}

  async reviewResume(input: ReviewResumeRequestDto): Promise<ResumeReview> {
    const conventions = detectCvConventionIssues(
      input.resume_text,
      input.has_embedded_image ?? false,
    );
    const writing = buildResumeWritingReport(input.resume_text);
    const priorities = this.buildPriorities(conventions, writing);

    const critique = await this.ai_coach.reviewResume({
      resume_text: input.resume_text,
      job_posting_text: input.job_posting_text ?? null,
      already_detected: priorities,
    });

    return {
      conventions,
      writing,
      priorities,
      critique,
      is_partially_stubbed: critique.is_stubbed,
    };
  }

  /**
   * Ordered by cost to the reader rather than by how easy it is to fix.
   * Convention breaches come first because they can remove the CV from
   * consideration before anybody assesses the content.
   */
  private buildPriorities(
    conventions: CvConventionFinding[],
    writing: ResumeWritingReport,
  ): string[] {
    const priorities: string[] = [];

    for (const finding of conventions) {
      priorities.push(`${finding.headline} — ${finding.action}`);
    }

    if (
      writing.bullet_count > 0 &&
      writing.quantified_ratio < HEALTHY_QUANTIFIED_RATIO
    ) {
      priorities.push(
        `Only ${writing.quantified_bullet_count} of ${writing.bullet_count} bullets carry a number. A bullet without one describes a duty; a bullet with one describes a result.`,
      );
    }

    if (writing.duty_openers.length > 0) {
      const total = writing.duty_openers.reduce(
        (sum, finding) => sum + finding.occurrences,
        0,
      );
      priorities.push(
        `${total} bullet${total === 1 ? '' : 's'} open by describing the job rather than what you did — "${writing.duty_openers[0].phrase}" and similar.`,
      );
    }

    if (writing.unevidenced_claims.length > 0) {
      priorities.push(
        `Claims with no evidence attached: "${writing.unevidenced_claims.map((finding) => finding.phrase).join('", "')}". Every candidate writes these, so they carry no information — replace with the thing that proves it.`,
      );
    }

    if (writing.first_person_count > 2) {
      priorities.push(
        `"I" or "my" appears ${writing.first_person_count} times. A CV is written in implied first person, so the pronouns are redundant — unusually, this is the one document where dropping them is correct.`,
      );
    }

    if (writing.estimated_pages <= SHORT_CV_PAGES) {
      priorities.push(
        'This looks like a single page. Australian CVs commonly run to two or three — US one-page advice does not apply here, and a single page often means evidence has been cut that a reader wanted.',
      );
    }

    if (writing.estimated_pages >= LONG_CV_PAGES) {
      priorities.push(
        `About ${writing.estimated_pages} pages. Two or three is the Australian norm for a graduate; past that the last pages are skimmed.`,
      );
    }

    return priorities;
  }
}
