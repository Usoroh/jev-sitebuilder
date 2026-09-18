import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const posts = [
  { title: "Why the cursor decides", date: "12 September 2026", excerpt: "Place is a pointer problem. Only the words are a model problem." },
  { title: "Ten questions, one call", date: "28 August 2026", excerpt: "Adding a question cost us nothing, so we added nine." },
  { title: "[post title]", date: "[date]", excerpt: "[one line about the post]" },
];

export function Blog() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Notes from the build</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.title} className="transition-shadow hover:shadow-[var(--shadow-hard)]">
              <CardContent className="pt-6">
                <p className="font-mono text-[12px] text-muted-foreground">{post.date}</p>
                <CardTitle className="mt-2 text-[15px]">
                  <a href="#" className="after:absolute after:inset-0 after:content-['']">{post.title}</a>
                </CardTitle>
                <CardDescription className="mt-1.5">{post.excerpt}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
