import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Newsletter() {
  return (
    <section className="border-y border-border px-6 py-14">
      <form className="mx-auto flex max-w-3xl flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="min-w-[240px] flex-1">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-foreground">Changelog by email</h2>
          <p className="mt-1 text-[13.5px] text-muted-foreground">One note a month. Only what shipped.</p>
        </div>
        <div className="flex min-w-[260px] flex-1 items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="newsletter-email" className="sr-only">Email address</Label>
            <Input id="newsletter-email" type="email" placeholder="you@company.com" autoComplete="email" />
          </div>
          <Button type="submit">Subscribe</Button>
        </div>
      </form>
    </section>
  );
}
