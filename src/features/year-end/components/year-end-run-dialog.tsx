"use client";

import { useState, type FormEvent } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Calculator, Play, TriangleAlert } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { QueryState } from "@/components/shared/list-states";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { fiscalYearRange } from "@/lib/fiscal-year";
import { TAKA_INPUT_PATTERN } from "@/lib/money";
import { useSubmitLock } from "@/lib/use-submit-lock";

import {
  useAppropriationPreview,
  useDividendPreview,
  useRunYearEnd,
  useServiceChargePreview,
} from "../hooks/use-year-end";
import type { YearEndKind } from "../types";
import { getYearEndError } from "../year-end-errors";

import { MemberLinesTable } from "./member-lines-table";
import { AppropriationTable, DividendFigures, IncomeExpenseFigures, ServiceChargeFigures } from "./run-summary";

type YearEndRunDialogProps = {
  open: boolean;
  onClose: () => void;
  kind: YearEndKind;
  fiscalYear: string;
};

/**
 * Preview, then run, one year-end step (super admin). The preview is the
 * server's own calculation with today's data; the run repeats it and posts.
 * A run can't be undone, so it needs a ticked confirmation.
 */
export function YearEndRunDialog({ open, onClose, kind, fiscalYear }: YearEndRunDialogProps) {
  const t = useTranslations("YearEnd");
  const tErrors = useTranslations("YearEndErrors");
  const tKind = useTranslations("YearEnd.kinds");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const format = useFormatter();
  const toast = useToast();
  const runLocked = useSubmitLock();
  const run = useRunYearEnd(kind);

  // Dividend: the committee's amount (taka). `previewAmount` is what was previewed.
  const [amountText, setAmountText] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [previewAmount, setPreviewAmount] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const serviceCharge = useServiceChargePreview(fiscalYear, open && kind === "service_charge");
  const dividend = useDividendPreview(fiscalYear, open && kind === "dividend" ? previewAmount : null);
  const appropriation = useAppropriationPreview(fiscalYear, open && kind === "appropriation");

  const errorOptions = { t: tErrors, tKind, tCollections, locale };
  const previewError = (error: unknown) => getYearEndError(error, errorOptions).formError ?? tErrors("generic");
  const isBusy = run.isPending;
  const isDividend = kind === "dividend";
  const amountChanged = isDividend && previewAmount !== null && Number(amountText.trim()) !== previewAmount;
  const problems = appropriation.data?.problems ?? [];

  const previewReady =
    (kind === "service_charge" && !!serviceCharge.data) ||
    (kind === "dividend" && !!dividend.data && !amountChanged) ||
    (kind === "appropriation" && !!appropriation.data && problems.length === 0 && appropriation.data.summary.netProfit >= 0);
  const canRun = previewReady && confirmed && !isBusy;
  const lastDay = format.dateTime(new Date(`${fiscalYearRange(fiscalYear).to}T00:00:00+06:00`), {
    dateStyle: "long",
    timeZone: DHAKA_TIME_ZONE,
  });

  const showPreview = () => {
    const text = amountText.trim();
    if (!TAKA_INPUT_PATTERN.test(text) || Number(text) <= 0) {
      setAmountError(t("dividend.amountInvalid"));
      return;
    }
    setAmountError(null);
    setConfirmed(false);
    setPreviewAmount(Number(text));
  };

  const execute = async () => {
    setFormError(null);
    try {
      await run.mutateAsync({ kind, fiscalYear, distributableAmount: previewAmount ?? undefined });
      onClose();
      toast.success(t(`done.${kind}`, { fiscalYear }));
    } catch (error) {
      setFormError(getYearEndError(error, errorOptions).formError ?? tErrors("generic"));
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canRun) void runLocked(execute);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("runTitle", { kind: tKind(kind), fiscalYear })}
      description={t(`runDescription.${kind}`, { lastDay })}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submit}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("running") : t("runAction", { kind: tKind(kind) })}
          actionIcon={Play}
          isBusy={isBusy}
          actionDisabled={!previewReady || !confirmed}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      {isDividend && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FormField id="dividend-amount" label={t("dividend.amountLabel")} error={amountError ?? undefined}>
              <Input
                id="dividend-amount"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    showPreview();
                  }
                }}
                inputMode="decimal"
                autoComplete="off"
                placeholder={t("dividend.amountPlaceholder")}
                readOnly={isBusy}
                error={!!amountError}
                aria-describedby={amountError ? "dividend-amount-error" : "dividend-amount-hint"}
                className="min-h-11"
                data-autofocus
              />
            </FormField>
          </div>
          <Button type="button" variant="outline" onClick={showPreview} disabled={isBusy} className="gap-2">
            <Calculator aria-hidden="true" className="h-4 w-4" />
            {t("dividend.preview")}
          </Button>
        </div>
      )}
      {isDividend && (
        <p id="dividend-amount-hint" className="text-xs text-app-text-muted">
          {amountChanged ? t("dividend.previewAgain") : t("dividend.amountHint")}
        </p>
      )}

      {kind === "service_charge" && (
        <QueryState query={serviceCharge} errorTitle={serviceCharge.error ? previewError(serviceCharge.error) : ""} retryLabel={t("retry")}>
          {(preview) => (
            <div className="space-y-3">
              <ServiceChargeFigures summary={preview.summary} settings={preview.settings} />
              <MemberLinesTable kind="service_charge" lines={preview.lines} />
            </div>
          )}
        </QueryState>
      )}

      {isDividend && previewAmount !== null && (
        <QueryState query={dividend} errorTitle={dividend.error ? previewError(dividend.error) : ""} retryLabel={t("retry")}>
          {(preview) => (
            <div className="space-y-3">
              <DividendFigures summary={preview.summary} settings={preview.settings} />
              <MemberLinesTable kind="dividend" lines={preview.lines} />
            </div>
          )}
        </QueryState>
      )}

      {kind === "appropriation" && (
        <QueryState query={appropriation} errorTitle={appropriation.error ? previewError(appropriation.error) : ""} retryLabel={t("retry")}>
          {(preview) => (
            <div className="space-y-3">
              <IncomeExpenseFigures summary={preview.summary} />
              <AppropriationTable lines={preview.appropriations} />
              {preview.summary.netProfit < 0 && <FormAlert message={tErrors("netLoss", { fiscalYear })} />}
              {problems.length > 0 && (
                <div role="alert" className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">{t("appropriation.problemsTitle")}</p>
                  <p>{t("appropriation.problemsBody")}</p>
                  <Link href="/admin/collections/heads?kind=fund" className="font-semibold underline underline-offset-2">
                    {t("appropriation.openHeads")}
                  </Link>
                </div>
              )}
            </div>
          )}
        </QueryState>
      )}

      {previewReady && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {t(`warning.${kind}`)}
          </p>
          <label className="flex items-start gap-2.5 text-sm font-medium text-app-text">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={isBusy}
              className="mt-0.5 h-4 w-4 accent-app-primary"
            />
            {t("confirm")}
          </label>
        </div>
      )}
    </Dialog>
  );
}
