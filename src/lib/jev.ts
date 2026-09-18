import { choice, score, type ChoiceResponse, type ScoreResponse } from "@typesafe-ai/sdk";
import { BLOCK_CRITERIA, type BlockId } from "@/blocks/catalog";
import { COLOR_CRITERIA, type ColorId, type ColorPart } from "./palette";
import { CASE_CRITERIA, FORMAT_CRITERIA, type TextCase, type TextFormat } from "./spoken-text";
import {
  ALIGN_CRITERIA,
  ALIGN_WHAT_CRITERIA,
  LAYOUT_CRITERIA,
  MOVE_CRITERIA,
  REACH_CRITERIA,
  SIZE_CRITERIA,
  SPACE_CRITERIA,
  steps,
  type AlignId,
  type LayoutId,
  type AlignWhatId,
  type MoveId,
  type ReachId,
  SIDE_CRITERIA,
  type SideId,
} from "./shape";

export type Intent =
  | "add"
  | "remove"
  | "replace"
  | "edit"
  | "recolor"
  | "insertItem"
  | "removeItem"
  | "resize"
  | "respace"
  | "relayout"
  | "realign"
  | "moveItem"
  | "link"
  | "undo";

export interface Decision {
  intent: Intent;
  block: BlockId;
  color: ColorId;
  part: ColorPart;
  textCase: TextCase;
  format: TextFormat;
  /** How many levels bigger or smaller, from the size rubric. */
  size: number;
  /** How many levels looser or tighter, from the spacing rubric. */
  space: number;
  layout: LayoutId;
  align: AlignId;
  alignWhat: AlignWhatId;
  move: MoveId;
  side: SideId;
  reach: ReachId;
  /** Confidence in the answer that this intent actually uses. */
  confidence: number;
  /** Block ids ranked by probability, best first. */
  ranked: BlockId[];
  /** Colour ids ranked by probability, best first. */
  rankedColors: ColorId[];
  /** What this one command cost, in tokens. */
  usage: { input: number; output: number };
}

/**
 * Jev's published rate: $0.042 per million input tokens, output free.
 * https://typesafe.ai/blog/introducing-system-one-models-and-jev
 */
export const PRICE_PER_INPUT_TOKEN = 0.042 / 1_000_000;

export interface Target {
  /** Where a new block goes: index in the block list. */
  index: number;
  /** Plain-language description of what the pointer is over. */
  region: string;
  /** Label of the block under the pointer, if any. */
  over: string | null;
  /** The text the pointer sits on, if any. */
  text: string | null;
  /** What the pointer sits on when it sits on one of several like it. */
  item: string | null;
  /** What sort of thing the pointer is on. */
  kind: string;
}

/** What the speaker said, what was decided, and what the page did about it. */
export interface Turn {
  said: string;
  intent: Intent;
  did: string;
}

export class JevError extends Error {}

/** One state, five questions, answered in the same round trip. */
export async function decide(
  transcript: string,
  target: Target,
  page: string[],
  recent: Turn[],
): Promise<Decision> {
  const request = {
    state: {
      said: transcript,
      pointing_at: target.region,
      text_under_pointer: target.text,
      // A link is not a band: this is what separates "remove this" from
      // "remove this section".
      pointing_at_a: target.kind,
      // Set when the pointer sits on one of several like it: a link among
      // links, a card among cards, a plan among plans.
      one_of_a_list: target.item,
      page_so_far: page.length ? page : ["the page is empty"],
      // The last few rounds, oldest first, so a follow-up can point backwards.
      just_before: recent.length ? recent : "this is the first command",
    },
    questions: {
      intent: choice(
        [
          "What does the speaker want done to the page?",
          "A short follow-up such as \"this too\", \"and this one\", \"same here\" or \"again\" carries no action of its own: it repeats the intent of the last turn in just_before, against whatever the pointer is on now.",
        ].join(" "),
        {
        add: "Put a new section on the page at the place they point to.",
        edit: "Keep the section, but change the words of the text they point at. They speak the new words.",
        recolor: "Keep the words, but change the colour of the thing they point at.",
        insertItem:
          "Add one more of something beside what they point at: another link, another card, another plan, another button. Not a whole section. The new one starts as a copy of the one they point at, and `side` says which side it goes on.",
        removeItem:
          "Take one thing out and leave the rest of the section standing: a link, a button, an icon, a card, a plan, a row, a column, a cell, one line of text. The reach answer says whether they mean the one cell, its row or its column. This is the usual answer when they say \"remove this\", \"this one is extra\" or \"drop this element\" while pointing at something small. Look at pointing_at_a: anything that is not a whole band means they mean that one thing.",
        resize: "Keep everything, but make the words they point at bigger or smaller.",
        respace: "Keep everything, but change the room around what they point at: the padding of a band, or the gaps in a row of cards.",
        relayout: "Keep everything, but change how many things sit across a row, or whether they stack.",
        realign: "Keep everything, but line something up left, right, or in the middle: the words, or a row of cards that no longer fills its space.",
        moveItem: "Keep everything, but move one item to a different place among the others in its list.",
        link: "Point a link or a button at a section of this page, so that clicking it jumps there. They say things like \"make this go to the pricing\" or \"link this to the footer\". The block answer says which section they mean.",
        remove: "Throw away an entire band of the page and everything in it, when they say so: \"remove this whole section\", \"get rid of the pricing\". Not for one link, button or line inside it.",
        replace: "Swap the whole section they point at for a different kind of section.",
        undo: 'Take back the last change, whatever it was. They say things like "no", "go back" or "undo". The list in just_before says what would come off.',
        },
      ),
      block: choice(
        [
          "Which section do they ask for? Answer from the words they said.",
          "What the pointer rests on says where a section goes, never which one:",
          "pointing at a price while asking for a footer means a footer.",
        ].join(" "),
        BLOCK_CRITERIA,
      ),
      color: choice("Which colour do they ask for?", COLOR_CRITERIA),
      part: choice("Which part of the thing they point at takes the colour?", {
        background: "The surface behind the words: a section band, a card, or the fill of a button.",
        text: "The letters themselves, whatever they sit on. A button's label is text, not its fill.",
      }),
      textCase: choice(
        "How should the new words be capitalised? Match the text already there unless they ask otherwise.",
        CASE_CRITERIA,
      ),
      format: choice(
        "If they speak new words for the page, how should those words be written? Look at text_under_pointer: replacing a price with an amount means a price.",
        FORMAT_CRITERIA,
      ),
      size: score("If they ask about the size of the words, how big do they want them?", SIZE_CRITERIA),
      space: score("If they ask about spacing, how much room do they want?", SPACE_CRITERIA),
      layout: choice("If they ask about the layout, how should the items sit?", LAYOUT_CRITERIA),
      align: choice("If they ask about alignment, where should it sit?", ALIGN_CRITERIA),
      alignWhat: choice("If they ask about alignment, what are they lining up?", ALIGN_WHAT_CRITERIA),
      move: choice("If they ask to move one item, where should it go?", MOVE_CRITERIA),
      side: choice(
        "If they say where a thing goes relative to what they point at, which side did they say?",
        SIDE_CRITERIA,
      ),
      reach: choice("If they take something out of a table, how far does it reach?", REACH_CRITERIA),
    },
  };

  const response = await fetch("/api/jev", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new JevError(
      error === "no-api-key"
        ? "No TYPESAFE_API_KEY. Put one in .env and restart the server."
        : `Jev did not answer: ${error ?? response.status}`,
    );
  }

  const { answers, usage } = (await response.json()) as {
    usage: { input_tokens: number; output_tokens: number };
    answers: {
      intent: ChoiceResponse;
      block: ChoiceResponse;
      color: ChoiceResponse;
      part: ChoiceResponse;
      textCase: ChoiceResponse;
      format: ChoiceResponse;
      size: ScoreResponse;
      space: ScoreResponse;
      layout: ChoiceResponse;
      align: ChoiceResponse;
      alignWhat: ChoiceResponse;
      move: ChoiceResponse;
      side: ChoiceResponse;
      reach: ChoiceResponse;
    };
  };
  const intent = answers.intent.choice as Intent;

  return {
    intent,
    block: answers.block.choice as BlockId,
    color: answers.color.choice as ColorId,
    part: answers.part.choice as ColorPart,
    textCase: answers.textCase.choice as TextCase,
    format: answers.format.choice as TextFormat,
    size: steps(answers.size.score),
    space: steps(answers.space.score),
    layout: answers.layout.choice as LayoutId,
    align: answers.align.choice as AlignId,
    alignWhat: answers.alignWhat.choice as AlignWhatId,
    move: answers.move.choice as MoveId,
    side: answers.side.choice as SideId,
    reach: answers.reach.choice as ReachId,
    // Report the confidence of the answer this intent actually uses.
    confidence:
      intent === "recolor" ? answers.color.confidence
      : intent === "add" || intent === "replace" || intent === "link" ? answers.block.confidence
      : intent === "resize" ? answers.size.confidence
      : intent === "respace" ? answers.space.confidence
      : intent === "relayout" ? answers.layout.confidence
      : intent === "realign" ? answers.align.confidence
      : intent === "moveItem" ? answers.move.confidence
      : intent === "insertItem" ? answers.intent.confidence
      : answers.intent.confidence,
    ranked: rank<BlockId>(answers.block.probabilities as Record<string, number>),
    rankedColors: rank<ColorId>(answers.color.probabilities as Record<string, number>),
    usage: { input: usage?.input_tokens ?? 0, output: usage?.output_tokens ?? 0 },
  };
}

function rank<T extends string>(probabilities: Record<string, number>): T[] {
  return Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id as T);
}
