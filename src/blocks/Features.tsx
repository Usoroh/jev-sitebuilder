import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ZapIcon, GlobeIcon, CodeIcon, ShieldIcon } from "@/components/icons";

const features = [
  { Icon: ZapIcon, title: "Point, then speak", body: "Your cursor says where. The sentence says what." },
  { Icon: CodeIcon, title: "Answers, not prose", body: "Ten questions come back as values your code can branch on." },
  { Icon: ShieldIcon, title: "Nothing invented", body: "The words on the page are the words you said." },
  { Icon: GlobeIcon, title: "Any language", body: "Say it in Russian and Russian lands on the page." },
];

export function Features() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[20ch] text-balance text-[28px] font-medium tracking-[-0.025em] text-foreground">
          A page that listens
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
  );
}
