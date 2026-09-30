import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type InfoRow = { key: string; label: string; value: ReactNode; isEmpty?: boolean; mono?: boolean };

type InfoSectionProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  rows: InfoRow[];
  /** Shown instead of rows (e.g. a section that has no data yet). */
  children?: ReactNode;
};

// One titled card of label/value rows. Each part of the member profile
// (member info, society info, nominee, ...) is one of these.
export function InfoSection({ id, icon: Icon, title, hint, rows, children }: InfoSectionProps) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-app-border bg-app-surface shadow-xs motion-safe:animate-fade-in-up">
      <div className="flex items-start gap-3 px-5 pt-5 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
          <Icon aria-hidden="true" className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold text-app-text">
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-sm text-app-text-muted">{hint}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <dl className="mt-3 grid divide-y divide-app-border sm:grid-cols-2 sm:divide-y-0">
          {rows.map(({ key, label, value, isEmpty, mono }) => (
            <div key={key} className="px-5 py-3 sm:border-t sm:border-app-border sm:px-6">
              <dt className="text-xs font-medium text-app-text-muted">{label}</dt>
              <dd
                className={cn(
                  "mt-0.5 break-words text-sm font-medium",
                  isEmpty ? "font-normal italic text-app-text-muted" : "text-app-text",
                  mono && !isEmpty && "font-mono",
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children && <div className="px-5 pb-5 pt-3 sm:px-6">{children}</div>}
      {!children && <div className="h-2" />}
    </section>
  );
}
