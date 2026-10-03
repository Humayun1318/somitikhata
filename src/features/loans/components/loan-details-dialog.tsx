"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Banknote, CircleCheck, CircleX, HandCoins } from "lucide-react";

import { ListError } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { useLoanDetail } from "../hooks/use-loans";

import { LoanCashDialog, type LoanCashMode } from "./loan-cash-dialog";
import { LoanDecisionDialog, type LoanDecision } from "./loan-decision-dialog";
import { LoanStatusBadge } from "./loan-status-badge";

type LoanDetailsDialogProps = { open: boolean; onClose: () => void; loanNo: string };

type Action = { type: LoanDecision | LoanCashMode; key: number };

// GET /loans/:loanNo: the loan, its installments (made at disbursement) and
// what is still owed. The next step for its status opens on top of it.
export function LoanDetailsDialog({ open, onClose, loanNo }: LoanDetailsDialogProps) {
  const t = useTranslations("Loans");
  const format = useFormatter();
  const detail = useLoanDetail(open ? loanNo : "");
  const [action, setAction] = useState<Action | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const loan = detail.data?.loan;
  const installments = detail.data?.installments ?? [];
  const nextInstallment = installments.find((installment) => installment.status === "pending");
  const paidCount = installments.filter((installment) => installment.status === "paid").length;
  const totals = installments.reduce(
    (sum, installment) => ({
      principal: sum.principal + installment.principalDue,
      interest: sum.interest + installment.interestDue,
    }),
    { principal: 0, interest: 0 },
  );
  const day = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }) : "—";
  const facts = loan
    ? [
        { key: "rate", label: t("fields.rate"), value: `${format.number(loan.interestRatePercent)}%` },
        { key: "tenure", label: t("fields.tenure"), value: t("monthsValue", { months: format.number(loan.tenureMonths) }) },
        { key: "applied", label: t("dates.applied"), value: day(loan.appliedAt) },
        {
          key: "decided",
          label: loan.status === "rejected" ? t("dates.rejected") : t("dates.approved"),
          value: day(loan.approvedAt),
        },
        { key: "disbursed", label: t("dates.disbursed"), value: day(loan.disbursedAt) },
        { key: "closed", label: t("dates.closed"), value: day(loan.closedAt) },
      ]
    : [];
  const rows = installments.map((installment) => ({
    installment,
    due: day(installment.dueDate),
    paid: installment.status === "paid" ? t("paidOn", { date: day(installment.paidAt) }) : t("installmentPending"),
    isNext: installment._id === nextInstallment?._id,
  }));
  const progress = t("progress", { paid: format.number(paidCount), total: format.number(installments.length) });
  const canDecide = loan?.status === "applied";
  const canDisburse = loan?.status === "approved";
  const canCollect = loan?.status === "active" && !!nextInstallment;

  const openAction = (type: Action["type"]) => {
    setAction((current) => ({ type, key: (current?.key ?? 0) + 1 }));
    setIsActionOpen(true);
  };
  const closeAction = () => setIsActionOpen(false);
  const retry = () => void detail.refetch();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={t("detailsTitle", { loanNo })}
        closeLabel={t("close")}
        size="lg"
        footer={
          <DialogActions
            cancelLabel={t("close")}
            onCancel={onClose}
            actionLabel={canDecide ? t("approve") : canDisburse ? t("disburse") : canCollect ? t("collect") : undefined}
            actionIcon={canDecide ? CircleCheck : canDisburse ? Banknote : HandCoins}
            onAction={() => openAction(canDecide ? "approve" : canDisburse ? "disburse" : "repay")}
          >
            {canDecide && (
              <Button type="button" variant="outline" onClick={() => openAction("reject")} className="gap-2 text-red-700">
                <CircleX aria-hidden="true" className="h-4 w-4" />
                {t("reject")}
              </Button>
            )}
          </DialogActions>
        }
      >
        {detail.isPending && <div className="h-48 animate-pulse rounded-2xl bg-app-surface-muted" />}
        {detail.isError && (
          <ListError title={t("detailsError")} retryLabel={t("retry")} onRetry={retry} isRetrying={detail.isFetching} />
        )}

        {loan && (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-app-surface-muted/60 p-4">
            <div className="min-w-0">
              <p className="font-semibold text-app-text">{loan.member.nameBn}</p>
              <p className="font-mono text-xs text-app-text-muted">{loan.member.memberNo}</p>
              <div className="mt-2">
                <LoanStatusBadge status={loan.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-app-text-muted">{t("columns.principal")}</p>
              <Money paisa={loan.principal} className="text-2xl font-bold text-app-text" />
              {loan.status === "active" && detail.data && (
                <p className="mt-1 text-xs text-app-text-muted">
                  {t("outstanding")}:{" "}
                  <Money paisa={detail.data.outstandingPrincipal} className="font-semibold text-amber-700" />
                </p>
              )}
            </div>
          </div>
        )}

        {loan && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {facts.map(({ key, label, value }) => (
              <div key={key} className="min-w-0 border-b border-app-border pb-2">
                <dt className="text-xs font-medium text-app-text-muted">{label}</dt>
                <dd className={cn("mt-0.5 text-sm", value === "—" ? "text-app-text-muted" : "text-app-text")}>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {loan?.decisionNote && (
          <p className="rounded-xl border border-app-border p-3 text-sm text-app-text">
            <span className="block text-xs font-medium text-app-text-muted">{t("decisionNote")}</span>
            {loan.decisionNote}
          </p>
        )}

        {loan && installments.length === 0 && (
          <p className="text-sm text-app-text-muted">
            {loan.status === "rejected" ? t("noScheduleRejected") : t("noScheduleYet")}
          </p>
        )}

        {rows.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-app-text">{t("scheduleTitle")}</h3>
              <span className="text-xs text-app-text-muted">{progress}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-app-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-app-surface-muted/50 text-xs font-semibold text-app-text-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2">#</th>
                    <th scope="col" className="px-3 py-2">{t("columns.due")}</th>
                    <th scope="col" className="px-3 py-2 text-right">{t("columns.principalDue")}</th>
                    <th scope="col" className="px-3 py-2 text-right">{t("columns.interestDue")}</th>
                    <th scope="col" className="px-3 py-2">{t("columns.installmentStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {rows.map(({ installment, due, paid, isNext }) => (
                    <tr key={installment._id} className={cn(isNext && "bg-amber-50/60")}>
                      <td className="px-3 py-2 tabular-nums text-app-text">{format.number(installment.installmentNo)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-app-text">{due}</td>
                      <td className="px-3 py-2 text-right"><Money paisa={installment.principalDue} /></td>
                      <td className="px-3 py-2 text-right"><Money paisa={installment.interestDue} /></td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 py-2 text-xs",
                          installment.status === "paid" ? "text-emerald-700" : "text-app-text-muted",
                        )}
                      >
                        {paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-app-border bg-app-surface-muted/40 text-sm font-semibold">
                  <tr>
                    <td className="px-3 py-2" colSpan={2}>{t("scheduleTotal")}</td>
                    <td className="px-3 py-2 text-right"><Money paisa={totals.principal} /></td>
                    <td className="px-3 py-2 text-right"><Money paisa={totals.interest} /></td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}
      </Dialog>

      {loan && (action?.type === "approve" || action?.type === "reject") && (
        <LoanDecisionDialog key={action.key} open={isActionOpen} onClose={closeAction} loan={loan} decision={action.type} />
      )}
      {loan && (action?.type === "disburse" || action?.type === "repay") && (
        <LoanCashDialog
          key={action.key}
          open={isActionOpen}
          onClose={closeAction}
          loan={loan}
          mode={action.type}
          nextInstallment={nextInstallment}
        />
      )}
    </>
  );
}
