import { Steps as StepList } from "@/components/ui/steps";

const steps = [
  { title: "Point", description: "Put the cursor where the section belongs." },
  { title: "Say it", description: "Hold space and describe what you want there." },
  { title: "It lands", description: "The section appears, in the words you used." },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">
          Three steps, no menus
        </h2>
        <StepList className="mt-8" steps={steps} currentStep={3} orientation="vertical" />
      </div>
    </section>
  );
}
