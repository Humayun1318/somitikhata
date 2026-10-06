"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import {
  BadgePercent,
  CircleCheck,
  Clock,
  Eye,
  Landmark,
  Lock,
  LockOpen,
  Play,
  Plus,
  ReceiptText,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

import { QueryState } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { useMe } from "@/features/auth/hooks/use-me";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { fiscalYearLabel, previousFiscalYear, recentFiscalYears } from "@/lib/fiscal-year";

import { useYearEndStatus } from "../hooks/use-year-end";
import {
  YEAR_END_ORDER,
  type AppropriationSummary,
  type DividendSummary,
  type ServiceChargeSummary,
  type YearEndKind,
  type YearEndStatus,
  type YearEndStep,
} from "../types";

import { DepreciationDialog } from "./depreciation-dialog";
import { YearEndRunDetailsDialog } from "./year-end-run-details-dialog";
import { YearEndRunDialog } from "./year-end-run-dialog";

const STEP_ICONS: Record<YearEndKind, LucideIcon> = {
  service_charge: ReceiptText,
  dividend: BadgePercent,
  appropriation: Landmark,
};

type OpenDialog = { type: "run" | "details"; kind: YearEndKind } | { type: "depreciation" } | null;

// Year-end (বছর শেষ): service charge → depreciation → dividend → profit
// appropriation, which closes the year's books. Everyone on the admin side can
// follow the status; only the super admin can run the steps.
export function YearEndPage() {
  const t = useTranslations("YearEnd");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";

  // A year can only be finished after it ends, so the year before this one is the default.
  const years = recentFiscalYears(6);
  const requested = searchParams.get("year") ?? "";
  const fiscalYear = years.includes(requested) ? requested : previousFiscalYear(fiscalYearLabel());
  const status = useYearEndStatus(fiscalYear);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const yearOptions = years.map((year) => ({ value: year, label: t("yearOption", { year }) }));
  const changeYear = (year: string) => router.replace(`${pathname}?year=${year}`, { scroll: false });
  const open = (next: Exclude<OpenDialog, null>) => {
    setDialogKey((key) => key + 1);
    setDialog(next);
  };
  const close = () => setDialog(null);
  const formatDay = (value: string) => format.dateTime(new Date(value), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE });

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <div className="w-full sm:w-56">
          <SelectMenu value={fiscalYear} onChange={changeYear} options={yearOptions} aria-label={t("yearLabel")} searchable={false} />
        </div>
      </PageHeader>

      <QueryState query={status} errorTitle={t("statusError")} retryLabel={t("retry")}>
        {(data) => (
          <div className="space-y-4">
            <YearBanner status={data} formatDay={formatDay} />
            {!isSuperAdmin && <p className="rounded-xl bg-app-surface-muted px-4 py-3 text-sm text-app-text-muted">{t("adminNote")}</p>}

            <ol className="space-y-3">
              <StepCard
                number={1}
                step={stepOf(data, "service_charge")}
                status={data}
                isSuperAdmin={isSuperAdmin}
                onRun={() => open({ type: "run", kind: "service_charge" })}
                onDetails={() => open({ type: "details", kind: "service_charge" })}
              />
              <DepreciationCard
                status={data}
                canAdd={isSuperAdmin && !data.isClosed && !stepOf(data, "appropriation").done}
                onAdd={() => open({ type: "depreciation" })}
              />
              <StepCard
                number={3}
                step={stepOf(data, "dividend")}
                status={data}
                isSuperAdmin={isSuperAdmin}
                onRun={() => open({ type: "run", kind: "dividend" })}
                onDetails={() => open({ type: "details", kind: "dividend" })}
              />
              <StepCard
                number={4}
                step={stepOf(data, "appropriation")}
                status={data}
                isSuperAdmin={isSuperAdmin}
                onRun={() => open({ type: "run", kind: "appropriation" })}
                onDetails={() => open({ type: "details", kind: "appropriation" })}
              />
            </ol>
          </div>
        )}
      </QueryState>

      {isSuperAdmin && dialog?.type === "run" && (
        <YearEndRunDialog key={dialogKey} open onClose={close} kind={dialog.kind} fiscalYear={fiscalYear} />
      )}
      {dialog?.type === "details" && (
        <YearEndRunDetailsDialog key={dialogKey} open onClose={close} kind={dialog.kind} fiscalYear={fiscalYear} />
      )}
      {isSuperAdmin && dialog?.type === "depreciation" && (
        <DepreciationDialog key={dialogKey} open onClose={close} fiscalYear={fiscalYear} />
      )}
    </div>
  );
}

const stepOf = (status: YearEndStatus, kind: YearEndKind) =>
  status.steps.find((step) => step.kind === kind) ?? ({ kind, done: false, canRun: false } as YearEndStep);

function YearBanner({ status, formatDay }: { status: YearEndStatus; formatDay: (value: string) => string }) {
  const t = useTranslations("YearEnd");
  const doneCount = status.steps.filter((step) => step.done).length;
  const Icon = status.isClosed ? Lock : LockOpen;

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        status.isClosed ? "border-emerald-200 bg-emerald-50/70" : "border-app-border bg-app-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            status.isClosed ? "bg-emerald-100 text-emerald-700" : "bg-app-surface-muted text-app-primary",
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-app-text">
            {t("yearRange", { from: formatDay(status.start), to: formatDay(status.end) })}
          </p>
          <p className="mt-0.5 text-sm text-app-text-muted">
            {status.isClosed
              ? t("banner.closed", { date: status.lockUntil ? formatDay(status.lockUntil) : "" })
              : status.hasEnded
                ? t("banner.open")
                : t("banner.notEnded", { date: formatDay(status.end) })}
          </p>
        </div>
      </div>
      <p className="text-sm font-medium text-app-text-muted">{t("progress", { done: doneCount, total: YEAR_END_ORDER.length })}</p>
    </section>
  );
}

type StepCardProps = {
  number: number;
  step: YearEndStep;
  status: YearEndStatus;
  isSuperAdmin: boolean;
  onRun: () => void;
  onDetails: () => void;
};

function StepCard({ number, step, status, isSuperAdmin, onRun, onDetails }: StepCardProps) {
  const t = useTranslations("YearEnd");
  const tKind = useTranslations("YearEnd.kinds");
  const format = useFormatter();
  const Icon = STEP_ICONS[step.kind];
  const previous = YEAR_END_ORDER[YEAR_END_ORDER.indexOf(step.kind) - 1];

  // Why it can't run yet, worked out from the status (the backend's text is English).
  const waitingReason = step.done || step.canRun
    ? null
    : !status.hasEnded
      ? t("blocked.notEnded")
      : status.isClosed
        ? t("blocked.closed")
        : previous
          ? t("blocked.previous", { kind: tKind(previous) })
          : t("blocked.other");

  const ranAt = step.runAt ? format.dateTime(new Date(step.runAt), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }) : "";

  return (
    <li className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-surface-muted text-app-primary">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{t("stepNo", { number })}</p>
            <h2 className="font-semibold text-app-text">{tKind(step.kind)}</h2>
            <p className="mt-0.5 text-sm text-app-text-muted">{t(`stepBody.${step.kind}`)}</p>
            <div className="mt-2">
              <StepBadge done={step.done} ready={step.canRun} label={step.done ? t("state.done", { date: ranAt }) : step.canRun ? t("state.ready") : waitingReason ?? ""} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {step.done && <StepResult step={step} />}
          {step.done && (
            <Button type="button" variant="outline" onClick={onDetails} className="min-h-10 gap-2 px-3.5 py-2">
              <Eye aria-hidden="true" className="h-4 w-4" />
              {t("viewDetails")}
            </Button>
          )}
          {!step.done && step.canRun && isSuperAdmin && (
            <Button type="button" onClick={onRun} className="min-h-10 gap-2 px-3.5 py-2">
              <Play aria-hidden="true" className="h-4 w-4" />
              {t("previewAndRun")}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function StepBadge({ done, ready, label }: { done: boolean; ready: boolean; label: string }) {
  const Icon = done ? CircleCheck : Clock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        done ? "bg-emerald-50 text-emerald-700" : ready ? "bg-sky-50 text-sky-700" : "bg-app-surface-muted text-app-text-muted",
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

// The one figure that says what a finished step did.
function StepResult({ step }: { step: YearEndStep }) {
  const t = useTranslations("YearEnd.result");
  if (!step.summary) return null;

  if (step.kind === "service_charge") {
    const summary = step.summary as ServiceChargeSummary;
    return (
      <p className="text-sm text-app-text-muted sm:text-right">
        {t("charged")} <Money paisa={summary.totalCharged} className="font-semibold text-app-text" />
        {step.dues && step.dues.openDue > 0 && (
          <span className="block text-red-700">
            {t("openDue", { count: step.dues.membersWithOpenDue })} <Money paisa={step.dues.openDue} />
          </span>
        )}
      </p>
    );
  }
  if (step.kind === "dividend") {
    const summary = step.summary as DividendSummary;
    return (
      <p className="text-sm text-app-text-muted sm:text-right">
        {t("paid")} <Money paisa={summary.totalPaid} className="font-semibold text-emerald-700" />
      </p>
    );
  }
  const summary = step.summary as AppropriationSummary;
  return (
    <p className="text-sm text-app-text-muted sm:text-right">
      {t("netProfit")} <Money paisa={summary.netProfit} className="font-semibold text-app-text" />
    </p>
  );
}

function DepreciationCard({ status, canAdd, onAdd }: { status: YearEndStatus; canAdd: boolean; onAdd: () => void }) {
  const t = useTranslations("YearEnd");
  const lines = status.depreciation.lines;

  return (
    <li className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-surface-muted text-app-primary">
            <TrendingDown aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{t("stepNo", { number: 2 })}</p>
            <h2 className="font-semibold text-app-text">{t("depreciation.cardTitle")}</h2>
            <p className="mt-0.5 text-sm text-app-text-muted">{t("depreciation.cardBody")}</p>
            {lines.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {lines.map((line) => (
                  <li key={line.headId} className="flex justify-between gap-4">
                    <span className="text-app-text">{line.nameBn}</span>
                    <Money paisa={line.amount} className="font-medium" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-app-text-muted">{t("depreciation.none")}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {lines.length > 0 && (
            <p className="text-sm text-app-text-muted">
              {t("depreciation.total")} <Money paisa={status.depreciation.total} className="font-semibold text-app-text" />
            </p>
          )}
          {canAdd && (
            <Button type="button" variant="outline" onClick={onAdd} className="min-h-10 gap-2 px-3.5 py-2">
              <Plus aria-hidden="true" className="h-4 w-4" />
              {t("depreciation.add")}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
