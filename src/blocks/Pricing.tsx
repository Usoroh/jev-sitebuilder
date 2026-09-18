import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/icons";

const plans = [
  { name: "Free", price: "$0", note: "One page, no account", featured: false,
    perks: ["20 sections", "English and Russian", "Undo as far back as you like"] },
  { name: "[plan name]", price: "[$00]", note: "Per editor, per month", featured: true,
    perks: ["Unlimited pages", "Your own design system", "Export the code", "Shared voice history"] },
  { name: "Studio", price: "Custom", note: "Annual agreement", featured: false,
    perks: ["Your brand tokens", "Self-hosted", "A named engineer"] },
];

export function Pricing() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-[28px] font-medium tracking-[-0.025em] text-foreground">
          Priced per editor
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
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={plan.featured ? "default" : "outline"}>
                  {plan.price === "Custom" ? "Talk to us" : "Try it"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
