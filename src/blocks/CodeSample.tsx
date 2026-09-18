import { CodeTabs } from "@/components/ui/code-tabs";

const tabs = [
  {
    label: "TypeScript",
    lang: "ts",
    code: `const { answers } = await client.systemOne({
  state: { said, pointing_at, page_so_far },
  questions: {
    intent: choice("What do they want done?", INTENTS),
    block: choice("Which section?", SECTIONS),
  },
});

answers.intent.choice;     // "add"
answers.block.confidence;  // 0.96`,
  },
  {
    label: "Python",
    lang: "python",
    code: `response = client.system_one(
    state={"said": said, "pointing_at": region},
    questions={
        "intent": Choice("What do they want done?", INTENTS),
        "block": Choice("Which section?", SECTIONS),
    },
)

response.answers["intent"].choice`,
  },
  {
    label: "HTTP",
    lang: "bash",
    code: `curl https://api.typesafe.ai/v1/systemone \\
  -H "authorization: Bearer $TYPESAFE_API_KEY" \\
  -d '{"state": {"said": "a pricing section here"},
       "questions": {"block": {"type": "choice", "criteria": SECTIONS}}}'`,
  },
];

export function CodeSample() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">One call, every question</h2>
        <p className="mt-2 max-w-[60ch] text-[14.5px] text-muted-foreground">
          Every command on this page is one request. The answers come back as values.
        </p>
        <CodeTabs className="mt-8" tabs={tabs} />
      </div>
    </section>
  );
}
