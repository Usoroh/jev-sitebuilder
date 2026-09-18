import { ArrowRightIcon } from "@/components/icons";

export function Banner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-primary px-6 py-2.5 text-center text-[13px] text-primary-foreground">
      <span>Ten typed questions, one round trip, every command.</span>
      <a href="#" className="inline-flex items-center gap-1 font-medium underline underline-offset-2">
        See how
        <ArrowRightIcon className="size-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}
