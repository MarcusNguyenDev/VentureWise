import type {
  AnswerAttempt,
  AnswerProgress,
  AnswerReview,
  CameraPresenceReading,
  BehaviouralQuestion,
  InterviewPlan,
  PracticeSession,
  QualificationLevel,
  RecallDrillCard,
  ServiceHealth,
  SponsorshipBriefing,
  SponsorshipDrillScore,
  Story,
  TranscriptWord,
  VisaStatus,
} from "./api_contracts";

/**
 * The only place that knows the API's URL shape.
 *
 * Everything is a plain fetch — there is no auth to carry, because the spec
 * cuts accounts entirely.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly error_code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<ResponseType>(
  path: string,
  init?: RequestInit,
): Promise<ResponseType> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiRequestError(
      0,
      "NETWORK_UNREACHABLE",
      "Could not reach the API. Is it running on port 3001?",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new ApiRequestError(
      response.status,
      body?.error_code ?? "UNKNOWN_ERROR",
      body?.message ?? `Request failed with status ${response.status}.`,
    );
  }

  if (response.status === 204) return undefined as ResponseType;

  return (await response.json()) as ResponseType;
}

function post<ResponseType>(path: string, body?: unknown): Promise<ResponseType> {
  return request<ResponseType>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const api_client = {
  getHealth: () => request<ServiceHealth>("/health"),

  listQuestions: () => request<BehaviouralQuestion[]>("/questions"),

  getQuestion: (question_id: string) =>
    request<BehaviouralQuestion>(`/questions/${question_id}`),

  createSession: (input: {
    resume_text: string;
    job_posting_text: string;
    employer_name?: string;
    first_language?: string;
  }) => post<PracticeSession>("/sessions", input),

  getSession: (session_id: string) =>
    request<PracticeSession>(`/sessions/${session_id}`),

  startAttempt: (session_id: string, question_id: string) =>
    post<AnswerAttempt>(`/sessions/${session_id}/attempts`, { question_id }),

  appendTranscriptChunk: (
    session_id: string,
    attempt_id: string,
    chunk: {
      chunk_index: number;
      text: string;
      words: TranscriptWord[];
      is_final: boolean;
    },
  ) =>
    post<{ transcript_text: string }>(
      `/sessions/${session_id}/attempts/${attempt_id}/transcript`,
      chunk,
    ),

  trackProgress: (session_id: string, attempt_id: string) =>
    post<AnswerProgress>(
      `/sessions/${session_id}/attempts/${attempt_id}/progress`,
    ),

  completeAttempt: (
    session_id: string,
    attempt_id: string,
    body: { camera_presence?: CameraPresenceReading } = {},
  ) =>
    post<AnswerReview>(
      `/sessions/${session_id}/attempts/${attempt_id}/complete`,
      body,
    ),

  buildSponsorshipBriefing: (input: {
    visa_status: VisaStatus;
    qualification_level: QualificationLevel;
    graduate_visa_start_date?: string;
    course_completion_date?: string;
    is_regional_study: boolean;
    employer_name?: string;
  }) => post<SponsorshipBriefing>("/sponsorship/briefing", input),

  scoreSponsorshipDrill: (input: {
    spoken_text: string;
    spoken_seconds: number;
  }) => post<SponsorshipDrillScore>("/sponsorship/drill-score", input),

  listStories: (session_id: string) =>
    request<Story[]>(`/sessions/${session_id}/stories`),

  addStory: (
    session_id: string,
    input: { raw_memory_text: string; source_language?: string },
  ) => post<Story>(`/sessions/${session_id}/stories`, input),

  deleteStory: (session_id: string, story_id: string) =>
    request<void>(`/sessions/${session_id}/stories/${story_id}`, {
      method: "DELETE",
    }),

  buildRecallDrill: (session_id: string, question_id: string) =>
    request<RecallDrillCard>(
      `/sessions/${session_id}/stories/recall-drill/${question_id}`,
    ),

  buildInterviewPlan: (session_id: string) =>
    request<InterviewPlan>(`/sessions/${session_id}/panel/plan`),
};
