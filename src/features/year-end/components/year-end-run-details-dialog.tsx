"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";

import { QueryState } from "@/components/shared/list-states";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { useYearEndRun } from "../hooks/use-year-end";
import type {
  AppropriationSummary,
  DividendSettings,
  DividendSummary,
  ServiceChargeSettings,
  ServiceChargeSummary,
  YearEndKind,
} from "../types";
import { getYearEndError } from "../year-end-errors";

import { MemberLinesTable } from "./member-lines-table";
import { AppropriationTable, DividendFigures, IncomeExpenseFigures, ServiceChargeFigures } from "./run-summary";

type YearEndRunDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  kind: YearEndKind;
  fiscalYear: string;
};

// A finished run with every line, exactly as it was posted (GET /year-end/:year/:kind).
export function YearEndRunDetailsDialog({ open, onClose, kind, fiscalYear }: YearEndRunDetailsDialogProps) {
  const t = useTranslations("YearEnd");
  const tErrors = useTranslations("YearEndErrors");
  const tKind = useTranslations("YearEnd.kinds");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const format = useFormatter();
  const run = useYearEndRun(fiscalYear, kind, open);

  const errorTitle = run.error
    ? (getYearEndError(run.error, { t: tErrors, tKind, tCollections, locale }).formError ?? tErrors("generic"))
    : "";
  const runAt = run.data?.createdAt
    ? format.dateTime(new Date(run.data.createdAt), { dateStyle: "medium", timeStyle: "short", timeZone: DHAKA_TIME_ZONE })
    : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("detailsTitle", { kind: tKind(kind), fiscalYear })}
      description={runAt ? t("runAt", { when: runAt }) : undefined}
      closeLabel={t("close")}
      size="lg"
      footer={<DialogActions cancelLabel={t("close")} onCancel={onClose} />}
    >
      <QueryState query={run} errorTitle={errorTitle} retryLabel={t("retry")}>
        {(data) => (
          <div className="space-y-3">
            {kind === "service_charge" && (
              <ServiceChargeFigures summary={data.summary as ServiceChargeSummary} settings={data.settings as ServiceChargeSettings} />
            )}
            {kind === "dividend" && (
              <DividendFigures summary={data.summary as DividendSummary} settings={data.settings as DividendSettings} />
            )}
            {kind === "appropriation" && (
              <>
                <IncomeExpenseFigures summary={data.summary as AppropriationSummary} />
                <AppropriationTable lines={data.appropriations} />
              </>
            )}
            {kind !== "appropriation" && <MemberLinesTable kind={kind} lines={data.lines} />}
          </div>
        )}
      </QueryState>
    </Dialog>
  );
}
