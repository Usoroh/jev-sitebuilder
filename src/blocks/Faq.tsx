import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  { q: "Does it write the copy for me?", a: "No. The words on the page are the words you said. The model chooses which section, which colour and which action, never the text." },
  { q: "What happens when it is not sure?", a: "It says how sure it is and offers the three most likely answers. You pick one, or say it again differently." },
  { q: "Which languages can I speak?", a: "Whatever the browser transcribes. Russian and English are switched with the button beside the microphone." },
  { q: "Can I undo?", a: "Say \"go back\" as many times as you like. Every change is a step, including colours and deletions." },
];

export function Faq() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Asked within the first minute</h2>
        <Accordion multiple={false} className="mt-8">
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
