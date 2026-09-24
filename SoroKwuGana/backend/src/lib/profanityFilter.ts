/**
 * Lightweight profanity / harmful-content filter.
 * No external dependencies — pure regex matching against a curated word list.
 *
 * Strategy:
 *  1. Normalise the text (lowercase, strip leetspeak substitutions).
 *  2. Check against the harmful word list using whole-word boundaries.
 *  3. Return { clean: boolean, flaggedWords: string[] }.
 *
 * The list covers common English profanity, slurs, hate-speech triggers,
 * and spam/threat patterns. Extend HARMFUL_WORDS freely.
 */

// ── Normalisation helpers ─────────────────────────────────────────────────────
// Map common leet-speak / lookalike characters back to letters
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
  '6': 'g', '7': 't', '8': 'b', '@': 'a', '$': 's',
  '!': 'i', '+': 't', '(': 'c',
};

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[013456789@$!+(]/g, ch => LEET_MAP[ch] ?? ch)
    .replace(/[^a-z\s]/g, ' ')  // strip remaining punctuation
    .replace(/(.)\1{2,}/g, '$1$1') // collapse repeated chars: "fuuuck" → "fuuck"
    .trim();
}

// ── Harmful word list ─────────────────────────────────────────────────────────
// Sorted roughly by severity. Add/remove as needed for your audience.
const HARMFUL_WORDS: string[] = [
  // Strong profanity
  'fuck', 'fuck', 'fuk', 'fck',
  'shit', 'shyt', 'sht',
  'bitch', 'btch', 'bich',
  'asshole', 'ass hole', 'arsehole',
  'bastard', 'bastrd',
  'cunt', 'cnt',
  'dick', 'dik', 'dikk',
  'cock', 'cok',
  'pussy', 'pus sy',
  'whore', 'whor',
  'slut', 'sl ut',
  'nigger', 'nigga', 'nigg',
  'faggot', 'fag', 'fagot',
  'retard', 'retrd',
  'idiot', 'idi0t',
  'moron', 'mor0n',
  'stupid',
  'dumbass', 'dumb ass',
  'motherfucker', 'mf',
  'son of a bitch', 'soab',
  'go to hell',
  'kill yourself', 'kys',
  'die bitch',

  // Hate speech / slurs
  'nazi', 'n a z i',
  'hitler',
  'terrorist',
  'jihad',
  'kike', 'chink', 'spic', 'wetback', 'cracker', 'gook',

  // Threats / violence
  'i will kill', 'gonna kill',
  'bomb threat',
  'shoot you', 'shoot him', 'shoot her',

  // Spam patterns
  'click here to win',
  'you have won',
  'send me your',
  'nude', 'nudes',
  'sex video', 'porn',
  'pornhub', 'xvideos', 'onlyfans',
  'casino', 'free money',
  'whatsapp me', 'telegram me',
];

// Pre-compile: build one big regex with word boundaries
const _escaped = HARMFUL_WORDS.map(w =>
  w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')
);
const HARMFUL_REGEX = new RegExp(`\\b(${_escaped.join('|')})\\b`, 'gi');

// ── Public API ────────────────────────────────────────────────────────────────
export interface FilterResult {
  clean: boolean;
  flaggedWords: string[];
  /** Sanitised version with flagged words replaced by asterisks */
  sanitised: string;
}

export function filterContent(text: string): FilterResult {
  const norm = normalise(text);
  const matches = norm.match(HARMFUL_REGEX) ?? [];
  const flaggedWords = [...new Set(matches.map(m => m.toLowerCase()))];

  // Build sanitised version on the original text (not normalised)
  // so casing / punctuation is preserved for everything else
  let sanitised = text;
  if (flaggedWords.length > 0) {
    flaggedWords.forEach(word => {
      const wordRegex = new RegExp(
        `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'gi'
      );
      sanitised = sanitised.replace(wordRegex, m => '*'.repeat(m.length));
    });
  }

  return {
    clean: flaggedWords.length === 0,
    flaggedWords,
    sanitised,
  };
}
