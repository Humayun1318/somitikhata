"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CircleCheck, Scale, TriangleAlert } from "lucide-react";

import { ListError } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { cn } from "@/lib/cn";

import { useOpeningSummary } from "../hooks/use-collection-queries";
import type { Bucket, HeadKind, OpeningSummary } from "../types";

const MEMBER_BUCKETS: Bucket[] = ["share", "amanot", "stayi", "loan"];

// Opening total of the heads of some kinds (each head's balance is the backend's).
const headTotal = (summary: OpeningSummary, kinds: HeadKind[]) =>
  summary.heads.filter((head) => kinds.includes(head.kind)).reduce((sum, head) => sum + head.balance, 0);

// GET /transactions/opening-summary: everything entered as an opening, added up
// the way the উদ্বৃত্ত পত্র adds it. When every opening is in, the difference is 0.
export function OpeningSummaryCard() {
  const t = useTranslations("OpeningSummary");
  const tBucket = useTranslations("Collections.buckets");
  const format = useFormatter();
  const summary = useOpeningSummary();
  const data = summary.data;

  const memberRows = data
    ? MEMBER_BUCKETS.map((bucket) => ({
        bucket,
        total: data.members[bucket].total,
        count: t("memberCount", { count: data.members[bucket].memberCount, number: format.number(data.members[bucket].memberCount) }),
      }))
    : [];
  const assetRows = data
    ? [
        { key: "cash", label: t("cash"), total: data.totals.cash },
        { key: "assetHeads", label: t("assetHeads"), total: headTotal(data, ["asset"]) },
        { key: "loans", label: t("memberLoans"), total: data.members.loan.total },
      ]
    : [];
  const liabilityRows = data
    ? [
        { key: "share", label: tBucket("share"), total: data.members.share.total },
        { key: "amanot", label: tBucket("amanot"), total: data.members.amanot.total },
        { key: "stayi", label: tBucket("stayi"), total: data.members.stayi.total },
        { key: "liabilityHeads", label: t("liabilityHeads"), total: headTotal(data, ["liability"]) },
        { key: "fundHeads", label: t("fundHeads"), total: headTotal(data, ["fund"]) },
      ]
    : [];
  const difference = data?.totals.difference ?? 0;
  const isBalanced = !!data && difference === 0;
  const retry = () => void summary.refetch();

  return (
    <section className="space-y-4 rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
          <Scale aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-app-text">{t("title")}</h2>
          <p className="mt-0.5 text-sm text-app-text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {summary.isPending && <div className="h-40 animate-pulse rounded-xl bg-app-surface-muted" />}
      {summary.isError && !data && (
        <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={summary.isFetching} />
      )}

      {data && (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {memberRows.map(({ bucket, total, count }) => (
            <div key={bucket} className="rounded-xl bg-app-surface-muted/60 p-3">
              <dt className="text-xs font-medium text-app-text-muted">{tBucket(bucket)}</dt>
              <dd className="mt-1">
                <Money paisa={total} className="text-lg font-bold text-app-text" />
                <span className="block text-[11px] text-app-text-muted">{count}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {data && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-app-border p-3">
            <h3 className="text-sm font-semibold text-app-text">{t("assets")}</h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              {assetRows.map(({ key, label, total }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <dt className="text-app-text-muted">{label}</dt>
                  <dd><Money paisa={total} className="text-app-text" /></dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-app-border pt-1.5 font-semibold">
                <dt className="text-app-text">{t("total")}</dt>
                <dd><Money paisa={data.totals.assets} className="text-app-text" /></dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-app-border p-3">
            <h3 className="text-sm font-semibold text-app-text">{t("liabilities")}</h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              {liabilityRows.map(({ key, label, total }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <dt className="text-app-text-muted">{label}</dt>
                  <dd><Money paisa={total} className="text-app-text" /></dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-app-border pt-1.5 font-semibold">
                <dt className="text-app-text">{t("total")}</dt>
                <dd><Money paisa={data.totals.liabilities} className="text-app-text" /></dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {data && (
        <p
          className={cn(
            "flex items-start gap-2 rounded-xl p-3 text-sm",
            isBalanced ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900",
          )}
        >
          {isBalanced && <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
          {!isBalanced && <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>
            <span className="font-semibold">{t("difference")}: </span>
            <Money paisa={difference} className="font-semibold" />
            <span className="block text-xs">{isBalanced ? t("balanced") : t("notBalanced")}</span>
          </span>
        </p>
      )}
    </section>
  );
}
