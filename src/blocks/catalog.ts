import type { ComponentType } from "react";
import { Banner } from "./Banner";
import { Blog } from "./Blog";
import { CodeSample } from "./CodeSample";
import { Compare } from "./Compare";
import { Contact } from "./Contact";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Logos } from "./Logos";
import { NavBar } from "./NavBar";
import { Newsletter } from "./Newsletter";
import { Pricing } from "./Pricing";
import { Stats } from "./Stats";
import { Showcase } from "./Showcase";
import { HowItWorks } from "./Steps";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";

export interface BlockSpec {
  label: string;
  /** Sent to Jev verbatim as the choice criterion for this block. */
  description: string;
  Component: ComponentType;
}

export const CATALOG = {
  banner: {
    label: "Announcement bar",
    description: "One announcement the reader should see before anything else, as a thin strip across the very top.",
    Component: Banner,
  },
  navbar: {
    label: "Navigation bar",
    description: "How a reader gets around the site: the bar along the top holding the brand, the links to the main pages, and the sign-in buttons.",
    Component: NavBar,
  },
  hero: {
    label: "Hero",
    description: "The opening pitch: one large headline saying what this is, a line saying why it matters, and the main buttons.",
    Component: Hero,
  },
  logos: {
    label: "Customer logos",
    description: "A row of customer or partner names, there to show that others already use this. Names only, no quotes and no numbers.",
    Component: Logos,
  },
  features: {
    label: "Feature grid",
    description: "What the thing can do, as a grid of short points, each with an icon, a title and a sentence.",
    Component: Features,
  },
  stats: {
    label: "Metrics row",
    description: "The numbers that make the case: usage, speed, counts, uptime, set large.",
    Component: Stats,
  },
  steps: {
    label: "How it works",
    description: "How to get started, laid out as a numbered sequence of steps.",
    Component: HowItWorks,
  },
  compare: {
    label: "Comparison table",
    description: "Why this one and not the alternatives, as a table with a tick or a cross in every cell.",
    Component: Compare,
  },
  code: {
    label: "Code sample",
    description: "How it looks in code, with a tab for each programming language.",
    Component: CodeSample,
  },
  showcase: {
    label: "Tabbed showcase",
    description: "Several different uses, one behind each tab, that a reader clicks through.",
    Component: Showcase,
  },
  pricing: {
    label: "Pricing plans",
    description: "What a reader pays and what they get for it: plan cards side by side, each with a price, a list of what is included, and a button.",
    Component: Pricing,
  },
  testimonials: {
    label: "Testimonials",
    description: "What customers say about it, as quotes with a name and a company.",
    Component: Testimonials,
  },
  faq: {
    label: "FAQ",
    description: "Answers to the doubts and objections a reader has before committing, as a list of questions that expand.",
    Component: Faq,
  },
  gallery: {
    label: "Screenshot gallery",
    description: "What it looks like, as a grid of screenshots or pictures with captions.",
    Component: Gallery,
  },
  blog: {
    label: "Blog posts",
    description: "Recent writing, as cards carrying a date and an excerpt.",
    Component: Blog,
  },
  team: {
    label: "Team",
    description: "Who is behind it: portraits of the people and what they do.",
    Component: Team,
  },
  cta: {
    label: "Call to action",
    description: "The closing ask, repeating the offer with one large button.",
    Component: Cta,
  },
  newsletter: {
    label: "Newsletter sign-up",
    description: "A way to keep in touch by email: one field and a subscribe button.",
    Component: Newsletter,
  },
  contact: {
    label: "Contact form",
    description: "A way to reach a person: a form with a name, an email and a message.",
    Component: Contact,
  },
  footer: {
    label: "Footer",
    description: "Columns of links to the rest of the site, a copyright line and social icons.",
    Component: Footer,
  },
} satisfies Record<string, BlockSpec>;

export type BlockId = keyof typeof CATALOG;

/**
 * Criteria map handed to Jev's `choice` primitive.
 *
 * The name goes in as well as the job. A description written only as a job
 * answers "somewhere to get around the site" but not "add a footer", and people
 * do both.
 */
export const BLOCK_CRITERIA = Object.fromEntries(
  Object.entries(CATALOG).map(([id, spec]) => [id, `${spec.label}. ${spec.description}`]),
) as Record<BlockId, string>;
