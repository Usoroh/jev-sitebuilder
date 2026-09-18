import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QuoteTextInlineIcon } from "@/components/icons";

const quotes = [
  { body: "I built the whole page in the time it used to take to pick a template.",
    name: "[name]", role: "[role, company]", initials: "??" },
  { body: "Pointing is the part that sells it. You put the cursor where you mean and it goes there.",
    name: "Priya Raman", role: "Design lead, Halcyon", initials: "PR" },
  { body: "It never wrote copy for me, which is exactly why I trust it with the page.",
    name: "Tom Vesely", role: "Founder, Kestrel", initials: "TV" },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">What people say after five minutes</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quotes.map((quote) => (
            <Card key={quote.name}>
              <CardContent className="pt-6">
                <QuoteTextInlineIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                <blockquote className="mt-4 text-[14.5px] leading-relaxed text-foreground">{quote.body}</blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{quote.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{quote.name}</p>
                    <p className="text-[12.5px] text-muted-foreground">{quote.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
