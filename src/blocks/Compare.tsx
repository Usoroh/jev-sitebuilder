import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon, CloseIcon } from "@/components/icons";

const columns = ["[product]", "Template builder", "Chat prompt"];

const rows = [
  { feature: "You say where it goes", has: [true, false, false] },
  { feature: "Changes one line, not the page", has: [true, true, false] },
  { feature: "Undo in one word", has: [true, false, false] },
  { feature: "Answers come back typed", has: [true, false, false] },
  { feature: "Works in any language", has: [true, false, true] },
];

export function Compare() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">How it compares</h2>
        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              {columns.map((column) => (
                <TableHead key={column} className="text-center">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.feature}>
                <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                {row.has.map((yes, i) => (
                  <TableCell key={columns[i]} className="text-center">
                    {yes ? (
                      <CheckIcon className="mx-auto size-4 text-primary" aria-label="yes" />
                    ) : (
                      <CloseIcon className="mx-auto size-4 text-muted-foreground" aria-label="no" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
