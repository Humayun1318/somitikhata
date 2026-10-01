import { useId, type ReactNode } from "react";

type FormSectionProps = {
  title: string;
  hint?: string;
  /** Small control on the right of the title, e.g. "Same as present address". */
  action?: ReactNode;
  children: ReactNode;
};

// One titled group of fields in a long form (member form, nominee form).
// Fields sit in a 2-column grid from sm up.
export function FormSection({ title, hint, action, children }: FormSectionProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-3 border-t border-app-border/70 pt-5 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h3 id={titleId} className="text-sm font-semibold text-app-text">
            {title}
          </h3>
          {hint && <p className="mt-0.5 text-xs text-app-text-muted">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
