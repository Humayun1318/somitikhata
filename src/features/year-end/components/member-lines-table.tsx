"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Input } from "@/components/ui/input";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { cn } from "@/lib/cn";

import type { YearEndMemberLine } from "../types";

type MemberLinesTableProps = {
  kind: "service_charge" | "dividend";
  lines: YearEndMemberLine[];
};

const normalize = (text: string) => text.toLocaleLowerCase().trim();

// Every member's line of a service charge or dividend (preview or run).
// A samiti has a few hundred members, so it filters in place and scrolls inside.
export function MemberLinesTable({ kind, lines }: MemberLinesTableProps) {
  const t = useTranslations("YearEnd.lines");
  const [query, setQuery] = useState("");

  const isDividend = kind === "dividend";
  const needle = normalize(query);
  const visible = needle
    ? lines.filter((line) => normalize(`${line.memberNo} ${line.nameBn}`).includes(needle))
    : lines;

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">{t("search")}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="min-h-10 pl-9"
        />
      </label>

      <div className="max-h-80 overflow-auto rounded-xl border border-app-border">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="sticky top-0 bg-app-surface-muted text-xs text-app-text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">{t("member")}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t(isDividend ? "base" : "balance")}</th>
              {isDividend && <th scope="col" className="px-3 py-2 text-right font-medium">{t("yearDeposit")}</th>}
              <th scope="col" className="px-3 py-2 text-right font-medium">{t(isDividend ? "dividend" : "charged")}</th>
              {!isDividend && <th scope="col" className="px-3 py-2 text-right font-medium">{t("due")}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {visible.map((line) => (
              <tr key={line.memberNo} className="align-top">
                <td className="px-3 py-2">
                  <span className="block font-medium text-app-text">{line.nameBn}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-xs text-app-text-muted">
                    <span className="font-mono">{line.memberNo}</span>
                    {line.status !== "active" && <MemberStatusBadge status={line.status} />}
                    {line.group && <span>{t(`groups.${line.group}`)}</span>}
                    {line.capped && <span className="rounded bg-amber-50 px-1.5 text-amber-800">{t("capped")}</span>}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Money paisa={line.balance} />
                </td>
                {isDividend && (
                  <td className="px-3 py-2 text-right">
                    <Money paisa={line.currentYearDeposit ?? 0} />
                  </td>
                )}
                <td className={cn("px-3 py-2 text-right font-semibold", isDividend ? "text-emerald-700" : "text-app-text")}>
                  <Money paisa={line.amount} />
                </td>
                {!isDividend && (
                  <td className="px-3 py-2 text-right">
                    {(line.due ?? 0) > 0 ? (
                      <span className="text-red-700">
                        <Money paisa={line.due ?? 0} />
                        {(line.recovered ?? 0) > 0 && (
                          <span className="block text-xs text-app-text-muted">
                            {t("recovered")} <Money paisa={line.recovered ?? 0} />
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-app-text-muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-app-text-muted">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-app-text-muted">{t("count", { shown: visible.length, total: lines.length })}</p>
    </div>
  );
}
