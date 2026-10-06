"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowRight, FolderTree, Lock, LockOpen, Pencil, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListEmpty, ListError, ListLoading } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useMe } from "@/features/auth/hooks/use-me";
import { getCollectionError } from "@/features/collections/collection-errors";
import { useHeadBalances } from "@/features/collections/hooks/use-collection-queries";
import type { HeadBalance, HeadKind } from "@/features/collections/types";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { fiscalYearStart } from "@/lib/fiscal-year";

import { useUpdateLedgerHeadStatus } from "../hooks/use-ledger-head-mutations";
import { HEAD_KINDS, type LedgerHead } from "../types";

import { LedgerHeadDialog } from "./ledger-head-dialog";

// Income and expense heads start from 0 every year, so they show this
// fiscal year's total. Asset, liability and fund heads show their balance.
const YEARLY_KINDS: HeadKind[] = ["income", "expense"];

type HeadDialog = { head?: LedgerHead; key: number };

const toKind = (value: string | null): HeadKind => HEAD_KINDS.find((kind) => kind === value) ?? "income";

// The samiti's ledger heads (খাত) by kind, each with its balance.
// Super admin adds, edits and closes heads; everyone sees the balances.
export function LedgerHeadsPage() {
  const t = useTranslations("LedgerHeads");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const format = useFormatter();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";

  const kind = toKind(searchParams.get("kind"));
  const yearStart = fiscalYearStart();
  const isYearly = YEARLY_KINDS.includes(kind);
  const allTime = useHeadBalances();
  const thisYear = useHeadBalances({ from: yearStart });
  const query = isYearly ? thisYear : allTime;
  const updateStatus = useUpdateLedgerHeadStatus();
  const [dialog, setDialog] = useState<HeadDialog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const heads = (query.data ?? []).filter((head) => head.kind === kind);
  const total = heads.filter((head) => head.status === "active").reduce((sum, head) => sum + head.balance, 0);
  const countByKind = (value: HeadKind) => (allTime.data ?? []).filter((head) => head.kind === value).length;
  const kindOptions = HEAD_KINDS.map((value) => ({
    value,
    label: allTime.data ? `${t(`kinds.${value}`)} (${format.number(countByKind(value))})` : t(`kinds.${value}`),
  }));
  const yearStartText = format.dateTime(new Date(`${yearStart}T00:00:00+06:00`), {
    dateStyle: "medium",
    timeZone: DHAKA_TIME_ZONE,
  });
  const balanceLabel = isYearly ? t("thisYear") : t("balance");
  const totalHint = isYearly ? t("thisYearHint", { date: yearStartText }) : t("balanceHint");
  const togglingId = updateStatus.isPending ? updateStatus.variables?.id : undefined;
  const rows = heads.map((head) => ({
    head,
    sectionText: head.section ? t(`sections.${head.section}`) : "",
    isClosed: head.status === "closed",
    isToggling: togglingId === head._id,
    entriesHref: `/admin/collections/society?head=${head._id}`,
  }));

  const changeKind = (value: string) => router.replace(`${pathname}?kind=${value}`, { scroll: false });
  const openDialog = (head?: LedgerHead) => {
    setDialog((current) => ({ head, key: (current?.key ?? 0) + 1 }));
    setIsDialogOpen(true);
  };
  const closeDialog = () => setIsDialogOpen(false);
  const retry = () => void query.refetch();

  const toggleStatus = async (head: HeadBalance) => {
    if (updateStatus.isPending) return;
    const status = head.status === "active" ? "closed" : "active";
    try {
      await updateStatus.mutateAsync({ id: head._id, status });
      toast.success(t(status === "closed" ? "closedToast" : "reopenedToast", { name: head.nameBn }));
    } catch (error) {
      toast.error(getCollectionError(error, tErrors, locale).formError ?? tErrors("generic"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        {isSuperAdmin && (
          <Button onClick={() => openDialog()} className="w-full gap-2 sm:w-auto">
            <Plus aria-hidden="true" className="h-4 w-4" />
            {t("addHead")}
          </Button>
        )}
      </PageHeader>

      <SegmentedControl aria-label={t("kindFilter")} value={kind} onChange={changeKind} options={kindOptions} />

      <section className="flex flex-col gap-1 rounded-2xl bg-app-primary p-5 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{t("totalOf", { kind: t(`kinds.${kind}`) })}</p>
          <p className="mt-0.5 text-xs text-white/70">{totalHint}</p>
        </div>
        <div className="min-h-9">
          {query.data && <Money paisa={total} className="text-3xl font-bold" />}
          {!query.data && <div className="h-9 w-44 animate-pulse rounded-lg bg-white/20" />}
        </div>
      </section>

      {query.isPending && <ListLoading rows={4} />}
      {query.isError && !query.data && (
        <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={query.isFetching} />
      )}
      {query.data && heads.length === 0 && (
        <ListEmpty
          icon={FolderTree}
          title={t("empty.title", { kind: t(`kinds.${kind}`) })}
          body={isSuperAdmin ? t("empty.bodySuperAdmin") : t("empty.body")}
        />
      )}

      {rows.length > 0 && (
        <ul className="divide-y divide-app-border overflow-hidden rounded-2xl border border-app-border bg-app-surface">
          {rows.map(({ head, sectionText, isClosed, isToggling, entriesHref }) => (
            <li
              key={head._id}
              className={cn(
                "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5",
                isClosed && "bg-app-surface-muted/40",
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-app-text">{head.nameBn}</p>
                  {isClosed && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {t("closed")}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-app-text-muted">
                  {head.nameEn && <span>{head.nameEn}</span>}
                  {sectionText && <span>{sectionText}</span>}
                  {head.role && <span>{t(`roles.${head.role}`)}</span>}
                  <span>{t("orderValue", { order: format.number(head.displayOrder) })}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="sm:text-right">
                  <p className="text-[11px] font-medium text-app-text-muted">{balanceLabel}</p>
                  <Money
                    paisa={head.balance}
                    className={cn("text-lg font-bold", head.balance < 0 ? "text-red-700" : "text-app-text")}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={entriesHref}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-app-primary hover:underline"
                  >
                    {t("entries")}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  {isSuperAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openDialog(head)}
                      className="min-h-9 gap-1.5 px-3 py-1.5 text-xs"
                    >
                      <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                      {t("edit")}
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void toggleStatus(head)}
                      isLoading={isToggling}
                      className="min-h-9 gap-1.5 px-3 py-1.5 text-xs"
                    >
                      {!isToggling && !isClosed && <Lock aria-hidden="true" className="h-3.5 w-3.5" />}
                      {!isToggling && isClosed && <LockOpen aria-hidden="true" className="h-3.5 w-3.5" />}
                      {isClosed ? t("reopenHead") : t("closeHead")}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isSuperAdmin && dialog && (
        <LedgerHeadDialog
          key={dialog.key}
          open={isDialogOpen}
          onClose={closeDialog}
          head={dialog.head}
          defaultKind={kind}
        />
      )}
    </div>
  );
}
