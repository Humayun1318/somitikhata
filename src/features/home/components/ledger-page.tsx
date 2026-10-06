import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

// Which way each sample row moves the balance (matches the row labels).
const ROW_SIGNS = [0, 1, 1, -1, -1, 1] as const;
// Lengths of the "handwritten" figures, so the column doesn't look machine-made.
const DATE_WIDTHS = ["w-14", "w-12", "w-14", "w-11", "w-14", "w-14"];
const AMOUNT_WIDTHS = ["w-16", "w-12", "w-14", "w-10", "w-9", "w-11"];

// The hero picture: a page of a member's passbook, drawn the way the samiti's
// paper khata looks (ruled lines, red margin). Real entry names, but no real
// numbers: the figures are ink strokes that are "written in" one row at a time.
export function LedgerPage() {
  const t = useTranslations("HomePage.hero.ledger");
  const rows = t.raw("rows") as string[];

  return (
    <figure className="mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative">
        {/* The page underneath, a little turned: a bound book, not a floating card. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1.5deg] rounded-2xl border border-app-border bg-app-surface-muted"
        />

        <div className="relative overflow-hidden rounded-2xl border border-app-border bg-white shadow-[0_24px_48px_-24px_rgba(15,107,79,0.35)]">
          <div className="flex items-center justify-between gap-3 bg-app-primary px-5 py-4 text-white">
            <div>
              <p className="text-base font-semibold">{t("title")}</p>
              <p className="text-xs text-white/75">{t("member")}</p>
            </div>
            <Image
              src="/branding/logo-mark-removebg-preview.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg bg-white p-1"
            />
          </div>

          <div aria-hidden="true" className="relative px-5 pb-4 pt-3">
            {/* The red margin of a khata */}
            <span className="absolute inset-y-0 left-[5.25rem] w-px bg-brand-maroon/40" />

            <div className="grid grid-cols-[4rem_1fr_auto] gap-x-4 border-b-2 border-app-border pb-2 text-xs font-semibold text-app-text-muted">
              <span>{t("date")}</span>
              <span>{t("entry")}</span>
              <span className="text-right">{t("amount")}</span>
            </div>

            {rows.map((row, index) => {
              const sign = ROW_SIGNS[index] ?? 0;
              return (
                <div
                  key={`${row}-${index}`}
                  className="grid min-h-11 grid-cols-[4rem_1fr_auto] items-center gap-x-4 border-b border-dashed border-app-border"
                >
                  <span
                    className={cn("ledger-ink block h-1.5 rounded-full bg-app-text/15", DATE_WIDTHS[index])}
                    style={{ animationDelay: `${300 + index * 140}ms` }}
                  />
                  <span className="truncate text-sm text-app-text">{row}</span>
                  <span className="flex items-center justify-end gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        sign > 0 ? "text-emerald-700" : sign < 0 ? "text-brand-maroon" : "text-app-text-muted",
                      )}
                    >
                      {sign > 0 ? "+" : sign < 0 ? "−" : "৳"}
                    </span>
                    <span
                      className={cn(
                        "ledger-ink block h-2 rounded-full",
                        AMOUNT_WIDTHS[index],
                        sign > 0 ? "bg-emerald-600/45" : sign < 0 ? "bg-brand-maroon/40" : "bg-app-text/25",
                      )}
                      style={{ animationDelay: `${380 + index * 140}ms` }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <figcaption className="relative mt-5 text-center text-xs text-app-text-muted">{t("caption")}</figcaption>
    </figure>
  );
}
