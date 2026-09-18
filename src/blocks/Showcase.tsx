import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const panels = [
  {
    id: "place",
    label: "Place",
    title: "Put a section where you point",
    body: "The blue line shows where it lands. Say what belongs there and it appears.",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    title: "Change one line, not the page",
    body: "Point at any words and say the new ones. Nothing else on the page moves.",
  },
  {
    id: "repaint",
    label: "Repaint",
    title: "Colour from the design system",
    body: "Ask for a colour and the words on top follow it, so nothing turns unreadable.",
  },
];

export function Showcase() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Three things to say</h2>
        <Tabs defaultValue="place" className="mt-8">
          <TabsList>
            {panels.map((panel) => (
              <TabsTrigger key={panel.id} value={panel.id}>
                {panel.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {panels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id} className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <h3 className="text-[19px] font-medium tracking-[-0.02em] text-foreground">{panel.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{panel.body}</p>
                </div>
                <AspectRatio
                  ratio={16 / 10}
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted"
                >
                  <div className="flex size-full items-end p-4">
                    <span className="text-[13px] font-medium text-muted-foreground">{panel.label}</span>
                  </div>
                </AspectRatio>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
