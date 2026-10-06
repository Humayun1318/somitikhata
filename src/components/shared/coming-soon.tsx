import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type ComingSoonProps = {
  icon: LucideIcon;
  /** What this page will do, one short sentence. */
  body: string;
  /** Optional way forward today, e.g. "Ask the office" + a link to a page that works now. */
  hint?: string;
  backHref?: string;
  backLabel?: string;
};

// A feature the backend does not support yet: a clear, finished-looking notice
// instead of an empty page. Never shows sample data.
export function ComingSoon({ icon: Icon, body, hint, backHref, backLabel }: ComingSoonProps) {
  const t = useTranslations("ComingSoon");

  return (
    <section className="flex flex-col items-center rounded-3xl border border-app-border bg-app-surface px-6 py-14 text-center sm:py-20">
      <div className="relative">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-app-primary/10 text-app-primary">
          <Icon aria-hidden="true" className="h-10 w-10" />
        </span>
        <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-app-surface bg-amber-400 text-white">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </div>
      <span className="mt-6 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
        {t("badge")}
      </span>
      <h2 className="mt-3 text-lg font-semibold text-app-text sm:text-xl">{t("title")}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-app-text-muted">{body}</p>
      {hint && <p className="mt-4 max-w-md rounded-xl bg-app-surface-muted px-4 py-3 text-sm text-app-text">{hint}</p>}
      {backHref && backLabel && (
        <Link
          href={backHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-app-border px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-surface-muted"
        >
          {backLabel}
        </Link>
      )}
    </section>
  );
}
