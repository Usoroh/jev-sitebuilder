import { Separator } from "@/components/ui/separator";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/icons";

const columns = [
  { heading: "Product", links: ["How it works", "Pricing", "Changelog", "Status"] },
  { heading: "Built on", links: ["Jev", "The primitives", "Confidence", "Patterns"] },
  { heading: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
];

const social = [
  { Icon: GithubIcon, label: "GitHub" },
  { Icon: MailIcon, label: "Email" },
  { Icon: LinkedinIcon, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">[product]</p>
            <p className="mt-2 max-w-[28ch] text-[13px] text-muted-foreground">
              A landing page you build by pointing and talking.
            </p>
          </div>
          {columns.map((column) => (
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
          <p className="text-[12.5px] text-muted-foreground">© 2026 [company name]</p>
          <ul className="flex items-center gap-1">
            {social.map(({ Icon, label }) => (
              <li key={label}>
                <a href="#" aria-label={label} className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
