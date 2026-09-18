const companies = ["Northwind", "Halcyon", "Verge Labs", "Ostara", "Tidewater", "Kestrel"];

export function Logos() {
  return (
    <section className="border-y border-border px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[13px] text-muted-foreground">Pages built this way at</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((name) => (
            <li key={name} className="text-[15px] font-medium tracking-[-0.01em] text-muted-foreground">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
