export const formFieldBase =
  "w-full rounded-md px-3 text-sm font-medium " +
  "bg-card text-foreground " +
  "border-2 border-border " +
  "shadow-[var(--shadow-hard-sm)] " +
  "placeholder:text-muted-foreground placeholder:font-normal " +
  "transition-all duration-150 " +
  "hover:-translate-x-px hover:-translate-y-px hover:shadow-[var(--shadow-hard)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0";

/** Height + vertical padding for single-line form fields (h-10) */
export const formFieldSingleLine = "flex h-10 py-2";

/** Vertical padding and min-height for multi-line form fields */
export const formFieldMultiLine = "flex min-h-[84px] py-2 resize-y";
