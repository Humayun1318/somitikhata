import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/cn";

type PasswordRule = { key: string; label: string; met: boolean };

type PasswordRulesChecklistProps = {
  id: string;
  title: string;
  metLabel: string;
  notMetLabel: string;
  rules: PasswordRule[];
  /** After a failed submit, unmet rules turn red so the user sees what is missing. */
  highlightUnmet: boolean;
};

export function PasswordRulesChecklist({
  id,
  title,
  metLabel,
  notMetLabel,
  rules,
  highlightUnmet,
}: PasswordRulesChecklistProps) {
  const items = rules.map((rule) => ({
    ...rule,
    Icon: rule.met ? Check : Circle,
    status: rule.met ? metLabel : notMetLabel,
    className: rule.met
      ? "text-emerald-700"
      : highlightUnmet
        ? "text-red-600"
        : "text-app-text-muted",
  }));

  return (
    <div id={id} className="mt-2.5 rounded-xl bg-app-surface-muted/60 px-3 py-2.5">
      <p className="text-xs font-medium text-app-text-muted">{title}</p>
      <ul className="mt-1.5 grid gap-1 sm:grid-cols-2 sm:gap-x-3">
        {items.map(({ key, label, status, Icon, className }) => (
          <li key={key} className={cn("flex items-center gap-1.5 text-xs transition-colors", className)}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span>{label}</span>
            <span className="sr-only">({status})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
