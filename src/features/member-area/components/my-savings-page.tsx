"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReceiptText } from "lucide-react";

import { ListEmpty, ListUpdatingHint, QueryState } from "@/components/shared/list-states";
import { PageHeader } from "@/components/shared/page-header";
import { PAGE_SIZE_OPTIONS, Pagination } from "@/components/shared/pagination";
import { useMyLedger, useMyOverview } from "@/features/overview/hooks/use-overview";
import { usePathname, useRouter } from "@/i18n/navigation";

import { MyBalances } from "./my-balances";
import { MyTransactionRows } from "./my-transaction-rows";

const DEFAULT_LIMIT = 10;

function toPositiveInt(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

// The member's own passbook: balances, then every entry (GET /transactions/my-ledger).
// Page and page size live in the URL, like the admin lists.
export function MySavingsPage() {
  const t = useTranslations("MemberArea");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = toPositiveInt(searchParams.get("page"), 1);
  const requestedLimit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = PAGE_SIZE_OPTIONS.includes(requestedLimit as never) ? requestedLimit : DEFAULT_LIMIT;

  const overview = useMyOverview();
  const ledger = useMyLedger(page, limit);
  const isUpdating = ledger.isFetching && ledger.isPlaceholderData;

  const go = (nextPage: number, nextLimit: number) => {
    const query = new URLSearchParams();
    if (nextPage !== 1) query.set("page", String(nextPage));
    if (nextLimit !== DEFAULT_LIMIT) query.set("limit", String(nextLimit));
    const text = query.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("savings.title")} subtitle={t("savings.subtitle")} />

      <QueryState
        query={overview}
        errorTitle={t("error")}
        retryLabel={t("retry")}
        loading={<div className="h-24 animate-pulse rounded-2xl bg-app-surface-muted" />}
      >
        {(data) => <MyBalances balances={data.balances} />}
      </QueryState>

      <section className="relative space-y-3">
        <h2 className="text-base font-semibold text-app-text">{t("savings.ledgerTitle")}</h2>
        <ListUpdatingHint show={isUpdating} label={t("updating")} />
        <QueryState query={ledger} errorTitle={t("savings.error")} retryLabel={t("retry")}>
          {(data) =>
            data.data.length === 0 ? (
              <ListEmpty icon={ReceiptText} title={t("savings.emptyTitle")} body={t("savings.emptyBody")} />
            ) : (
              <div className="space-y-4">
                <MyTransactionRows transactions={data.data} />
                <Pagination meta={data.meta} onPageChange={(next) => go(next, limit)} onLimitChange={(next) => go(1, next)} />
              </div>
            )
          }
        </QueryState>
      </section>
    </div>
  );
}
