import {
  analysePronounAttribution,
  PronounAttribution,
} from './pronoun_attribution.util';

/**
 * A mechanical "we" -> "I" rewrite, used as the stub for the slow loop.
 *
 * This only swaps pronouns and repairs the verb agreement that swap breaks. It
 * cannot tell a legitimate scene-setting "we" ("we were a team of five") from a
 * credit-giving one ("we decided to drop the outliers") — that judgement is why
 * `AiCoachPort.critiqueAnswer` exists. Output from this function is always
 * flagged `is_stubbed`.
 */

const PRONOUN_SUBSTITUTIONS: Record<string, string> = {
  we: 'I',
  our: 'my',
  us: 'me',
  ours: 'mine',
  ourselves: 'myself',
};

/**
 * Verb forms that agree with "we" but not with "I", keyed by the collective
 * form. Applied only directly after a substituted pronoun.
 */
const VERB_AGREEMENT_REPAIRS: Record<string, string> = {
  were: 'was',
  are: 'am',
  "were't": "wasn't",
  "weren't": "wasn't",
  "aren't": 'am not',
  "'re": "'m",
};

function matchCapitalisation(source_word: string, replacement: string): string {
  const is_capitalised =
    source_word.charAt(0) === source_word.charAt(0).toUpperCase() &&
    source_word.charAt(0) !== source_word.charAt(0).toLowerCase();

  if (!is_capitalised) return replacement;
  return replacement.charAt(0).toUpperCase() + replacement.slice(1);
}

export function rewriteInFirstPerson(transcript_text: string): string {
  const { mentions } = analysePronounAttribution(transcript_text);

  const collective_actor_mentions = mentions.filter(
    (mention) =>
      mention.attribution === PronounAttribution.COLLECTIVE &&
      mention.is_verb_attached,
  );

  if (collective_actor_mentions.length === 0) return transcript_text;

  // Rebuilt back to front so earlier character offsets stay valid.
  let rewritten_text = transcript_text;

  for (
    let index = collective_actor_mentions.length - 1;
    index >= 0;
    index -= 1
  ) {
    const mention = collective_actor_mentions[index];
    const substitution = PRONOUN_SUBSTITUTIONS[mention.token.toLowerCase()];
    if (!substitution) continue;

    const before = rewritten_text.slice(0, mention.char_start);
    const after = rewritten_text.slice(mention.char_end);

    rewritten_text =
      before + matchCapitalisation(mention.token, substitution) + after;
  }

  return repairVerbAgreement(rewritten_text);
}

/** Fixes the plural verbs left stranded by the pronoun swap. */
function repairVerbAgreement(text: string): string {
  return text.replace(
    /\b(I|my|me)\s+([A-Za-z']+)/g,
    (whole_match, pronoun: string, following_word: string) => {
      const repair = VERB_AGREEMENT_REPAIRS[following_word.toLowerCase()];
      if (!repair) return whole_match;

      return `${pronoun} ${matchCapitalisation(following_word, repair)}`;
    },
  );
}
