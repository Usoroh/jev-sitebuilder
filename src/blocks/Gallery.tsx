import { AspectRatio } from "@/components/ui/aspect-ratio";

const shots = ["Pointing", "The blue line", "Rewriting a line", "Repainting a band", "When it is unsure", "Going back"];

export function Gallery() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">What it looks like</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => (
            <li key={shot}>
              <AspectRatio
                ratio={16 / 10}
                className="overflow-hidden rounded-[var(--radius-lg)] bg-secondary shadow-[var(--shadow-hard-sm)]"
              >
                <div className="flex size-full items-end p-4">
                  <span className="text-[13px] font-medium text-muted-foreground">{shot}</span>
                </div>
              </AspectRatio>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
