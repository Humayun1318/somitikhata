"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Money } from "@/components/shared/money";
import type { Transaction } from "@/features/collections/types";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { memberRowEffect } from "../ledger-direction";

// The member's own passbook rows: date, what it was, which balance, amount.
export function MyTransactionRows({ transactions }: { transactions: Transaction[] }) {
  const t = useTranslations("MemberArea");
  const tBucket = useTranslations("Collections.buckets");
  const format = useFormatter();
  const locale = useLocale();

  return (
    <ul className="divide-y divide-app-border rounded-2xl border border-app-border bg-app-surface">
      {transactions.map((row) => {
        const effect = memberRowEffect(row.transactionType.code);
        const typeName = locale === "en" && row.transactionType.nameEn ? row.transactionType.nameEn : row.transactionType.nameBn;
        const signed = effect ? effect.sign * row.amount : row.amount;

        return (
          <li key={row._id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium text-app-text">{typeName}</p>
              <p className="text-xs text-app-text-muted">
                {format.dateTime(new Date(row.transactionDate), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE })}
                {" · "}
                <span className="font-mono">{row.transactionNo}</span>
                {effect && <> · {tBucket(effect.bucket)}</>}
                {row.reversalOf && <> · {t("reversal")}</>}
              </p>
            </div>
            <Money
              paisa={signed}
              signed={!!effect}
              className={cn(
                "shrink-0 font-semibold",
                !effect ? "text-app-text" : effect.bucket === "loan" ? "text-app-text" : signed > 0 ? "text-emerald-700" : "text-red-700",
              )}
            />
          </li>
        );
      })}
    </ul>
  );
}
