import { Button } from "@/components/ui/button";

const links = ["How it works", "Pricing", "Docs", "Changelog"];

export function NavBar() {
  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6" aria-label="Main">
        <a
          href="#"
          className="relative text-[15px] font-medium tracking-[-0.02em] text-foreground before:absolute before:inset-x-[-8px] before:inset-y-[-11px] before:content-['']"
        >
          [product]
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
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
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button size="sm">Try it</Button>
        </div>
      </nav>
    </header>
  );
}
