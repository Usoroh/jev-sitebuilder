import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Contact() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Ask us anything</h2>
        <p className="mt-2 text-[14.5px] text-muted-foreground">We answer within a day.</p>
        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Work email</Label>
            <Input id="contact-email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">What would you build with it?</Label>
            <Textarea id="contact-message" rows={4} />
          </div>
          <Button type="submit">Send message</Button>
        </form>
      </div>
    </section>
  );
}
