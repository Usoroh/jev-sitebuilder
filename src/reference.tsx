import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/ui/stat-card";
import {
  ArrowRightIcon,
  CheckIcon,
  ZapIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  QuoteTextInlineIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";

/**
 * A finished page to aim at. It shares the design system with the builder and
 * nothing else: no import from src/blocks, no shared copy, no shared state.
 * Rebuilding it is the exercise, so it must not be free.
 */

const navLinks = ["Timeline", "Reviews", "Pricing", "Changelog"];

const features = [
  { Icon: ZapIcon, title: "Timeline in one click", body: "Every alert, deploy and message lands on one scrubbable track." },
  { Icon: ShieldIcon, title: "Blameless by default", body: "Templates keep the review about the system, not the engineer." },
  { Icon: SparklesIcon, title: "Draft the write-up", body: "Lantern proposes the summary. You keep the judgement." },
  { Icon: MailIcon, title: "Follow-ups that close", body: "Actions become tickets, and the ticket reports back." },
];

const stats = [
  { label: "Median time to review", value: "31h", change: { value: "-12h", trend: "up" as const } },
  { label: "Reviews closed on time", value: "92%", change: { value: "+9pts", trend: "up" as const } },
  { label: "Follow-ups still open", value: "14", change: { value: "-23", trend: "up" as const } },
  { label: "Teams on call", value: "480", change: { value: "steady", trend: "neutral" as const } },
];

const quotes = [
  { body: "Our reviews used to slip a fortnight. Now they close before the next on-call rotation.", name: "Ines Halloran", role: "SRE lead, Cobalt Freight", initials: "IH" },
  { body: "The timeline ended the argument about when the deploy actually landed.", name: "Bo Lindqvist", role: "Platform, Stenhus", initials: "BL" },
  { body: "Follow-ups stopped rotting in a doc. They are tickets, and they close.", name: "Amara Diallo", role: "Director of engineering, Ferrous", initials: "AD" },
];

const plans = [
  { name: "Solo", price: "$0", note: "One on-call rotation", featured: false, perks: ["5 reviews a month", "30-day timeline history", "Community support"] },
  { name: "Rotation", price: "$18", note: "Per responder, per month", featured: true, perks: ["Unlimited reviews", "One year of history", "Ticket sync", "Shared templates"] },
  { name: "Fleet", price: "Custom", note: "Annual agreement", featured: false, perks: ["SSO and SCIM", "Retention you choose", "A named reliability engineer"] },
];

const faqs = [
  { q: "Which paging tools do you read?", a: "PagerDuty, Opsgenie, Grafana OnCall and anything that can post a webhook." },
  { q: "Does Lantern write the postmortem for me?", a: "It drafts the timeline and the summary. Every word stays editable, and nothing publishes on its own." },
  { q: "Where does our incident data live?", a: "In Frankfurt or Oregon, your choice, encrypted and deleted on the schedule you set." },
  { q: "Can we try it during a real incident?", a: "Yes. The trial runs for 30 days with no card, and imports the last 90 days of alerts." },
];

const footerColumns = [
  { heading: "Product", links: ["Timeline", "Reviews", "Templates", "Integrations"] },
  { heading: "Resources", links: ["Docs", "Incident library", "On-call guide", "Status"] },
  { heading: "Company", links: ["About", "Security", "Privacy", "Terms"] },
];

const social = [
  { Icon: GithubIcon, label: "GitHub" },
  { Icon: MailIcon, label: "Email" },
  { Icon: LinkedinIcon, label: "LinkedIn" },
];

function Reference() {
  return (
    <>
      <header className="border-b border-border bg-card">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6" aria-label="Main">
          <a
            href="#"
            className="relative text-[15px] font-medium tracking-[-0.02em] text-foreground before:absolute before:inset-x-[-8px] before:inset-y-[-11px] before:content-['']"
          >
            Lantern
          </a>
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="relative text-[13.5px] text-muted-foreground transition-colors hover:text-foreground before:absolute before:inset-x-[-8px] before:inset-y-[-10px] before:content-['']"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm">Log in</Button>
            <Button size="sm">Book a call</Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="tint px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-[44px] font-medium leading-[1.08] tracking-[-0.03em] text-foreground">
              Every incident reviewed by Friday
            </h1>
            <p className="mx-auto mt-5 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
              Lantern builds the timeline while the page is still open, so the review is half written when you sit down.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">
                Book a call
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Button>
              <Button size="lg" variant="outline">Read a sample review</Button>
            </div>
            <p className="mt-4 text-[12.5px] text-muted-foreground">30-day trial. No card.</p>
          </div>
        </section>

        <section className="border-y border-border px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-[13px] text-muted-foreground">On call at</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Cobalt Freight", "Stenhus", "Ferrous", "Marlowe Pay", "Orbit Grocer", "Danube"].map((name) => (
                <li key={name} className="text-[15px] font-medium tracking-[-0.01em] text-muted-foreground">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-[20ch] text-balance text-[28px] font-medium tracking-[-0.025em] text-foreground">
              The hour after the page, written down
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ Icon, title, body }) => (
                <Card key={title}>
                  <CardContent className="pt-6">
                    <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
                    <CardTitle className="mt-4 text-[15px]">{title}</CardTitle>
                    <CardDescription className="mt-1.5">{body}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">What responders say</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {quotes.map((quote) => (
                <Card key={quote.name}>
                  <CardContent className="pt-6">
                    <QuoteTextInlineIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                    <blockquote className="mt-4 text-[14.5px] leading-relaxed text-foreground">{quote.body}</blockquote>
                    <div className="mt-5 flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{quote.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{quote.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">{quote.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-[28px] font-medium tracking-[-0.025em] text-foreground">
              Priced per responder
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.featured ? "ring-1 ring-ring" : undefined}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-[15px]">{plan.name}</CardTitle>
                      {plan.featured ? <Badge>Most picked</Badge> : null}
                    </div>
                    <p className="pt-2 text-[32px] font-medium tracking-[-0.03em] text-foreground">{plan.price}</p>
                    <CardDescription>{plan.note}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-[13.5px] text-muted-foreground">
                          <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-6 w-full" variant={plan.featured ? "default" : "outline"}>
                      {plan.price === "Custom" ? "Talk to us" : "Start the trial"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Before you switch</h2>
            <Accordion multiple={false} className="mt-8">
              {faqs.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl rounded-[var(--radius-xl)] bg-primary px-10 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-balance text-[30px] font-medium tracking-[-0.03em] text-primary-foreground">
              Close the last incident first
            </h2>
            <p className="mx-auto mt-3 max-w-[50ch] text-[15px] text-primary-foreground/75">
              Import ninety days of alerts and Lantern drafts the reviews you never finished.
            </p>
            <Button size="lg" variant="secondary" className="mt-7">
              Book a call
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">Lantern</p>
              <p className="mt-2 max-w-[28ch] text-[13px] text-muted-foreground">
                Incident review for teams who carry a pager.
              </p>
            </div>
            {footerColumns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-[12.5px] font-medium text-foreground">{column.heading}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <Separator className="my-10" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12.5px] text-muted-foreground">© 2026 Lantern Reliability AB</p>
            <ul className="flex items-center gap-1">
              {social.map(({ Icon, label }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Reference />
  </StrictMode>,
);
