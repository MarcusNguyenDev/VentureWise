import { BehaviouralQuestion } from '../question_library/behavioural_question.entity';
import { Story } from './entities/story.entity';

/**
 * The retrieval half of F-04: flash a question, four seconds, which of your
 * stories answers it?
 *
 * Having a story bank is not the skill. Reaching the right story under pressure
 * in a second language is, and that is what this drills.
 */

/** Long enough to recall, short enough to stay uncomfortable. */
export const RECALL_DRILL_SECONDS = 4;

export interface RecallDrillCard {
  question_id: string;
  question_text: string;
  /** Every story in the bank, in shuffled order — the candidate picks one. */
  story_options: RecallDrillOption[];
  /** Stories whose themes match, so the answer can be checked client-side. */
  matching_story_ids: string[];
  seconds_allowed: number;
}

export interface RecallDrillOption {
  story_id: string;
  title: string;
}

function normaliseTheme(theme: string): string {
  return theme.toLowerCase().trim();
}

/**
 * A story matches a question when its themes overlap the question's category or
 * any word in the question's `what_lands` guidance.
 */
function doesStoryMatchQuestion(
  story: Story,
  question: BehaviouralQuestion,
): boolean {
  const question_terms = new Set(
    [question.category, ...question.what_lands]
      .join(' ')
      .toLowerCase()
      .match(/[a-z]{4,}/g) ?? [],
  );

  return story.themes.some((theme) => {
    const normalised_theme = normaliseTheme(theme);

    if (question_terms.has(normalised_theme)) return true;

    return normalised_theme
      .split(/\s+/)
      .some((word) => word.length >= 4 && question_terms.has(word));
  });
}

/** Deterministic shuffle, so a card renders the same way twice in a demo. */
function shuffleBySeed<ItemType>(items: ItemType[], seed: string): ItemType[] {
  const seed_value = [...seed].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return [...items].sort((left, right) => {
    const left_key = (items.indexOf(left) + seed_value) % items.length;
    const right_key = (items.indexOf(right) + seed_value * 7) % items.length;
    return left_key - right_key;
  });
}

export function buildRecallDrillCard(
  question: BehaviouralQuestion,
  stories: Story[],
): RecallDrillCard {
  return {
    question_id: question.question_id,
    question_text: question.question_text,
    story_options: shuffleBySeed(stories, question.question_id).map(
      (story) => ({
        story_id: story.story_id,
        title: story.title,
      }),
    ),
    matching_story_ids: stories
      .filter((story) => doesStoryMatchQuestion(story, question))
      .map((story) => story.story_id),
    seconds_allowed: RECALL_DRILL_SECONDS,
  };
}
