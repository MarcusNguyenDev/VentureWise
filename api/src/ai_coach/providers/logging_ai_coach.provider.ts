import { Injectable, Logger } from '@nestjs/common';

import {
  bad,
  dim,
  formatDuration,
  formatLane,
  formatProviderTag,
  label,
  LogLane,
  warn,
} from '../../shared/logging/log_format.util';
import {
  AiCoachPort,
  BuildInterviewPlanInput,
  BuildInterviewPlanResult,
  CritiqueAnswerInput,
  CritiqueAnswerResult,
  DecodeSubtextInput,
  DecodeSubtextResult,
  ExtractStoryInput,
  ExtractStoryResult,
  StubbableResult,
  TrackAnswerProgressInput,
  TrackAnswerProgressResult,
} from '../ai_coach.contract';

/**
 * Wraps whichever `AiCoachPort` is bound and logs every call through it.
 *
 * Decorating rather than logging inside each provider means the stub and the
 * model are measured identically — which is the point, because the question
 * this exists to answer is "is the app waiting on a model, or is it just
 * showing stub placeholders?". A `STUB` tag on a 0 ms call answers it instantly.
 *
 * A call still outstanding after `STILL_WAITING_MS` logs a warning rather than
 * going quiet, so a hang looks different from a slow answer in the log.
 */
@Injectable()
export class LoggingAiCoachProvider implements AiCoachPort {
  private readonly logger = new Logger('AiCoach');

  /**
   * Past this, say so — a silent gap is indistinguishable from a hang.
   *
   * Deliberately above the *normal* range rather than the spec's 800 ms
   * target: measured gpt-5.6-luna calls land at 2-3.5 s, so a 2 s threshold
   * would have warned on every single mid-loop call and taught you to ignore
   * the warning. This sits just under OPENAI_MID_LOOP_TIMEOUT_MS (8000), so a
   * line here means the call is about to be abandoned.
   */
  private static readonly STILL_WAITING_MS = 6000;

  constructor(private readonly delegate: AiCoachPort) {}

  async trackAnswerProgress(
    input: TrackAnswerProgressInput,
  ): Promise<TrackAnswerProgressResult> {
    return this.runLogged(
      'trackAnswerProgress',
      LogLane.MID_LOOP,
      () => this.delegate.trackAnswerProgress(input),
      (result) =>
        `stage=${result.current_stage} quantified=${result.has_quantified_result} ` +
        `nudge=${result.nudge_text === null ? dim('none') : label(`"${truncate(result.nudge_text, 60)}"`)}`,
    );
  }

  async critiqueAnswer(
    input: CritiqueAnswerInput,
  ): Promise<CritiqueAnswerResult> {
    return this.runLogged(
      'critiqueAnswer',
      LogLane.SLOW_LOOP,
      () => this.delegate.critiqueAnswer(input),
      (result) =>
        `rewrite=${result.first_person_rewrite.length}chars ` +
        `variants=${result.length_variants.length}`,
    );
  }

  async decodeSubtext(input: DecodeSubtextInput): Promise<DecodeSubtextResult> {
    return this.runLogged(
      'decodeSubtext',
      LogLane.SLOW_LOOP,
      () => this.delegate.decodeSubtext(input),
      (result) => `phrases=${result.untranslated_phrases.length}`,
    );
  }

  async extractStoryFromMemory(
    input: ExtractStoryInput,
  ): Promise<ExtractStoryResult> {
    return this.runLogged(
      'extractStoryFromMemory',
      LogLane.OFF_PATH,
      () => this.delegate.extractStoryFromMemory(input),
      (result) =>
        `language=${result.detected_language} themes=${result.themes.length}`,
    );
  }

  async buildInterviewPlan(
    input: BuildInterviewPlanInput,
  ): Promise<BuildInterviewPlanResult> {
    return this.runLogged(
      'buildInterviewPlan',
      LogLane.OFF_PATH,
      () => this.delegate.buildInterviewPlan(input),
      (result) =>
        `gaps=${result.coverage_gaps.length} rounds=${result.rounds.length}`,
    );
  }

  private async runLogged<ResultType extends StubbableResult>(
    method_name: string,
    lane: LogLane,
    call: () => Promise<ResultType>,
    describeResult: (result: ResultType) => string,
  ): Promise<ResultType> {
    const started_at_ms = Date.now();

    const still_waiting_timer = setTimeout(() => {
      this.logger.warn(
        `${formatLane(lane)} ${method_name} ${warn('still waiting…')} ` +
          dim(`(over ${LoggingAiCoachProvider.STILL_WAITING_MS}ms)`),
      );
    }, LoggingAiCoachProvider.STILL_WAITING_MS);

    try {
      const result = await call();
      const duration_ms = Date.now() - started_at_ms;

      this.logger.log(
        `${formatLane(lane)} ${formatProviderTag(result.is_stubbed)} ` +
          `${method_name.padEnd(22)} ${formatDuration(duration_ms)} ` +
          dim('·') +
          ` ${describeResult(result)}`,
      );

      return result;
    } catch (error) {
      const duration_ms = Date.now() - started_at_ms;
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `${formatLane(lane)} ${bad('FAILED')} ${method_name.padEnd(22)} ` +
          `${formatDuration(duration_ms)} ${dim('·')} ${message}`,
      );

      throw error;
    } finally {
      clearTimeout(still_waiting_timer);
    }
  }
}

function truncate(text: string, max_length: number): string {
  return text.length <= max_length ? text : `${text.slice(0, max_length - 1)}…`;
}
