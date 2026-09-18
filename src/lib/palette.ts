/**
 * The colours a person can ask for, in the words they use, mapped to Riso
 * tokens. The descriptions go to Jev verbatim as `choice` criteria.
 *
 * Each entry carries `on`: the token that stays readable on top of it. A
 * background change sets both, so an edit can never hide its own text.
 */

export interface Swatch {
  description: string;
  /** CSS variable painted on the element. */
  css: string;
  /** CSS variable for text that sits on this colour. */
  on: string;
}

export const PALETTE = {
  ink: {
    description: "Near-black ink. The darkest colour in the system, and the colour of every border.",
    css: "--foreground",
    on: "--background",
  },
  paper: {
    description: "The warm off-white of the page itself.",
    css: "--background",
    on: "--foreground",
  },
  white: {
    description: "The brighter paper of a card sitting on the page.",
    css: "--card",
    on: "--card-foreground",
  },
  blue: {
    description: "The strong poster blue. Also the colour for anything bright, bold or highlighted.",
    css: "--primary",
    on: "--primary-foreground",
  },
  sky: {
    description: "A pale, soft blue.",
    css: "--secondary",
    on: "--secondary-foreground",
  },
  yellow: {
    description: "Bright yellow, the loudest colour here.",
    css: "--accent",
    on: "--accent-foreground",
  },
  orange: {
    description: "Warm orange, between the yellow and the red.",
    css: "--chart-2",
    on: "--foreground",
  },
  green: {
    description: "Green. The colour for success, growth or money.",
    css: "--chart-4",
    on: "--foreground",
  },
  pink: {
    description: "Hot pink, the brightest warm colour.",
    css: "--chart-5",
    on: "--foreground",
  },
  red: {
    description: "Red. The colour for danger, errors or anything destructive.",
    css: "--destructive",
    on: "--destructive-foreground",
  },
  faded: {
    description: "A soft grey for quiet, secondary words.",
    css: "--muted-foreground",
    on: "--background",
  },
} satisfies Record<string, Swatch>;

export type ColorId = keyof typeof PALETTE;
export type ColorPart = "background" | "text";

export const COLOR_CRITERIA = Object.fromEntries(
  Object.entries(PALETTE).map(([id, swatch]) => [id, swatch.description]),
) as Record<ColorId, string>;
