/**
 * One STAR story, extracted from a memory the candidate dumped in whatever
 * language they think in.
 *
 * The story bank is the account — it is the reason somebody opens this again
 * next week — so it is keyed by session id and nothing else.
 */
export interface Story {
  story_id: string;
  title: string;
  /** BCP-47 tag of the language the memory was written in. */
  detected_language: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  /** Behavioural themes this story can answer, used by the recall drill. */
  themes: string[];
  created_at_ms: number;
  /** True while the extraction came from fixtures rather than a model. */
  is_stubbed: boolean;
}
