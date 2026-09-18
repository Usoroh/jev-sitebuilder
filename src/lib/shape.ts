/**
 * The shape knobs: size, spacing, layout, alignment and order. Every one is a
 * fixed set, so Jev can answer it outright.
 *
 * Size and spacing are magnitudes, so they are `score` questions: an ordered
 * rubric where the middle level means "leave it alone".
 */

export const SIZE_CRITERIA = [
  "Much smaller than it is now.",
  "A little smaller.",
  "Leave the size as it is.",
  "A little bigger.",
  "Much bigger.",
] as const;

export const SPACE_CRITERIA = [
  "Much tighter, with far less room around it.",
  "A little tighter.",
  "Leave the spacing as it is.",
  "A little looser.",
  "Much looser, with far more room around it.",
] as const;

/** A score of 2 is the middle of the rubric, so it means no change. */
export function steps(score: number): number {
  return Math.round(score) - 2;
}

export const LAYOUT_CRITERIA = {
  one: "One item per row, each full width.",
  two: "Two side by side.",
  three: "Three across.",
  four: "Four across.",
  stacked: "Stacked in a single column, one under the other.",
  row: "All in one row, side by side.",
} as const;

export const ALIGN_CRITERIA = {
  left: "Line the words up on the left.",
  center: "Put the words in the middle.",
  right: "Line the words up on the right.",
} as const;

export const ALIGN_WHAT_CRITERIA = {
  words: "The words themselves, inside whatever holds them.",
  group: "The things laid out in a row: the cards, the links, the buttons, moved together.",
} as const;

export const REACH_CRITERIA = {
  thing: "Only the one thing they point at.",
  row: "The whole row it sits in, all the way across the table.",
  column: "The whole column it sits in, all the way down the table.",
} as const;

export const MOVE_CRITERIA = {
  earlier: "One place towards the start: up, or to the left.",
  later: "One place towards the end: down, or to the right.",
  first: "All the way to the start.",
  last: "All the way to the end.",
} as const;

export const SIDE_CRITERIA = {
  after: "They said below it, under it, after it, or to its right.",
  before: "They said above it, over it, before it, or to its left.",
  unsaid: "They did not say a side at all. Nothing in the words puts it above or below anything.",
} as const;

export type SideId = keyof typeof SIDE_CRITERIA;
export type AlignWhatId = keyof typeof ALIGN_WHAT_CRITERIA;
export type ReachId = keyof typeof REACH_CRITERIA;
export type LayoutId = keyof typeof LAYOUT_CRITERIA;
export type AlignId = keyof typeof ALIGN_CRITERIA;
export type MoveId = keyof typeof MOVE_CRITERIA;

/** The CSS a layout answer sets on the container it is pointed at. */
export const LAYOUT_CSS: Record<LayoutId, Record<string, string>> = {
  one: { display: "grid", "grid-template-columns": "repeat(1, minmax(0, 1fr))" },
  two: { display: "grid", "grid-template-columns": "repeat(2, minmax(0, 1fr))" },
  three: { display: "grid", "grid-template-columns": "repeat(3, minmax(0, 1fr))" },
  four: { display: "grid", "grid-template-columns": "repeat(4, minmax(0, 1fr))" },
  stacked: { display: "flex", "flex-direction": "column" },
  row: { display: "flex", "flex-direction": "row", "flex-wrap": "wrap" },
};

/** Puts a new position into a sequence, beside the one pointed at. */
export function insertBeside(sequence: number[], beside: number, added: number, side: SideId): number[] {
  const at = sequence.indexOf(beside);
  const next = sequence.filter((position) => position !== added);
  next.splice(at === -1 ? next.length : at + (side === "before" ? 0 : 1), 0, added);
  return next;
}

/** Moves one item within a sequence of positions, and returns the new order. */
export function reorder(sequence: number[], item: number, move: MoveId): number[] {
  const from = sequence.indexOf(item);
  if (from === -1) return sequence;
  const to =
    move === "first" ? 0
    : move === "last" ? sequence.length - 1
    : move === "earlier" ? Math.max(0, from - 1)
    : Math.min(sequence.length - 1, from + 1);
  const next = sequence.slice();
  next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
