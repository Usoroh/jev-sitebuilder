import { StatCard } from "@/components/ui/stat-card";

const stats = [
  { label: "Questions per command", value: "10", change: { value: "one call", trend: "neutral" as const } },
  { label: "Typical answer", value: "0.9s", change: { value: "-0.4s", trend: "up" as const } },
  { label: "Sections to choose from", value: "20", change: { value: "+3", trend: "up" as const } },
  { label: "Words written by the model", value: "0", change: { value: "by design", trend: "neutral" as const } },
];

export function Stats() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
