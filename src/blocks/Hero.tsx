import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="bg-card px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-[44px] font-medium leading-[1.08] tracking-[-0.03em] text-foreground">
          [your headline here]
        </h1>
        <p className="mx-auto mt-5 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
          Point at the page and say what belongs there. The cursor decides where, the words decide what.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">
            Try it
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button size="lg" variant="outline">Watch the tour</Button>
        </div>
        <p className="mt-4 text-[12.5px] text-muted-foreground">No account. Nothing to install.</p>
      </div>
    </section>
  );
}
