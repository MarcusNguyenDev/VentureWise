import {
  UNTRANSLATED_PHRASES,
  UntranslatedPhraseEntry,
} from './untranslated_phrases.const';

/**
 * Lexicon match over the transcript. Deterministic and free — the model is only
 * asked to explain phrases this misses.
 */

export interface DetectedUntranslatedPhrase extends UntranslatedPhraseEntry {
  char_start: number;
  char_end: number;
}

function escapeForRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectUntranslatedPhrases(
  transcript_text: string,
): DetectedUntranslatedPhrase[] {
  const detected: DetectedUntranslatedPhrase[] = [];

  for (const entry of UNTRANSLATED_PHRASES) {
    const phrase_pattern = new RegExp(
      `\\b${escapeForRegex(entry.phrase)}\\b`,
      'gi',
    );

    let match: RegExpExecArray | null;
    while ((match = phrase_pattern.exec(transcript_text)) !== null) {
      detected.push({
        ...entry,
        char_start: match.index,
        char_end: match.index + match[0].length,
      });
    }
  }

  return detected.sort((left, right) => left.char_start - right.char_start);
}
