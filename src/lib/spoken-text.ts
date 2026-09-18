/**
 * Turns a spoken command into the words that land on the page.
 *
 * Jev returns typed decisions, never generated text, so the words themselves
 * come from the transcript. Jev decides how they are cased.
 */

export type TextCase = "spoken" | "sentence" | "title" | "upper" | "lower";

export const CASE_CRITERIA: Record<TextCase, string> = {
  spoken: "Leave the words exactly as the speaker said them.",
  sentence: "One capital at the start, like a sentence or an ordinary label.",
  title: "A capital on each main word, like the title of a book.",
  upper: "Every letter a capital, for a loud short label.",
  lower: "Every letter in lower case, for a quiet one.",
};

/**
 * Where the new words start. Cyrillic is not a word character to a JavaScript
 * `\b`, so the boundaries are spelled out.
 */
const CONNECTIVE =
  /(?:^|[\s,:;])(?:to|into|say|says|saying|read|reads|make it|на|напиши|напишите|чтобы было|чтобы стало|сделай)(?:[\s,:]+)(.+)$/iu;

/** A verb between the connective and the words themselves. */
const LEAD = /^(?:say|says|read|reads|be|скажи|будет|было|написано)(?:[\s,:]+)/iu;

/** Said at the end of a command, these words ask for a case, not for text. */
const CASE_TAIL =
  /[\s,]+(?:in\s+)?(?:all\s+)?(?:caps|capitals|capital letters|uppercase|upper case|lowercase|lower case|small letters|title case|sentence case|заглавными|заглавными буквами|прописными|прописными буквами|капсом|маленькими буквами|в верхнем регистре|в нижнем регистре)\.?$/iu;

export function spokenText(transcript: string): string | null {
  const after = transcript.match(CONNECTIVE)?.[1] ?? "";
  const text = after
    .replace(LEAD, "")
    .replace(CASE_TAIL, "")
    .replace(/^["'“”«»]+|["'“”«».]+$/g, "")
    .trim();
  return text || null;
}

const SMALL = new Set(["a", "an", "the", "and", "or", "nor", "but", "of", "to", "in", "on", "at", "for", "with", "by", "as", "per"]);

/**
 * Only ever changes the case of a letter, never the letters themselves. The
 * sentence case keeps the rest of the words as spoken, so "SSO" survives.
 */
export function applyCase(text: string, textCase: TextCase): string {
  if (textCase === "upper") return text.toUpperCase();
  if (textCase === "lower") return text.toLowerCase();
  if (textCase === "sentence") return text.charAt(0).toUpperCase() + text.slice(1);
  if (textCase === "title") {
    return text
      .split(/(\s+)/)
      .map((word, index) =>
        index > 0 && SMALL.has(word.toLowerCase()) ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");
  }
  return text;
}

export type TextFormat = "plain" | "price";

export const FORMAT_CRITERIA: Record<TextFormat, string> = {
  plain: "Write the words the way they were said.",
  price:
    "Write it as a price: a currency sign in front of a number, like $10. Use this when the words being replaced are a price, or when they speak an amount of money.",
};

const SPOKEN_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** "twenty four" to 24, "two hundred" to 200. Enough for a price. */
function spokenNumber(words: string[]): number | null {
  let total = 0;
  let running = 0;
  let found = false;
  for (const word of words) {
    const value = SPOKEN_NUMBERS[word];
    if (value !== undefined) {
      running += value;
      found = true;
    } else if (word === "hundred") {
      running = (running || 1) * 100;
      found = true;
    } else if (word === "thousand") {
      total += (running || 1) * 1000;
      running = 0;
      found = true;
    }
  }
  return found ? total + running : null;
}

/** A dictated amount, written the way a price is written. */
export function asPrice(text: string): string {
  const said = text.toLowerCase();
  const sign =
    /€|euro/.test(said) ? "€"
    : /£|pound|quid/.test(said) ? "£"
    : /₽|rub|рубл/.test(said) ? "₽"
    : "$";
  const digits = said.replace(/[,\s](?=\d)/g, "").match(/\d+(?:[.,]\d+)?/);
  const amount = digits ? digits[0].replace(",", ".") : spokenNumber(said.split(/\W+/));
  return amount === null ? text : `${sign}${amount}`;
}
