import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const people = [
  { name: "[your name]", role: "[your role]", initials: "??" },
  { name: "Marcus Lin", role: "Design", initials: "ML" },
  { name: "Sofia Berg", role: "Engineering", initials: "SB" },
  { name: "Jonah Reyes", role: "Support", initials: "JR" },
];

export function Team() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">Who built it</h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {people.map((person) => (
            <li key={person.name}>
              <Avatar className="size-16">
                <AvatarFallback className="text-[16px]">{person.initials}</AvatarFallback>
              </Avatar>
              <p className="mt-4 text-[14.5px] font-medium text-foreground">{person.name}</p>
              <p className="text-[13px] text-muted-foreground">{person.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
