import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

export function Cta() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-xl)] bg-primary px-10 py-14 text-center shadow-[var(--shadow-hard)]">
        <h2 className="text-balance text-[30px] font-medium tracking-[-0.03em] text-primary-foreground">
          [closing line here]
        </h2>
        <p className="mx-auto mt-3 max-w-[50ch] text-[15px] text-primary-foreground/75">
          Open a blank page, hold the space bar, and say what belongs at the top.
        </p>
        <Button size="lg" variant="secondary" className="mt-7">
          Try it
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
