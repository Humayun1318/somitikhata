"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MemberPreview } from "@/features/collections/components/member-preview";
import { useMemberBalances, useMemberLookup } from "@/features/collections/hooks/use-collection-queries";
import { useSetting } from "@/features/settings/hooks/use-settings";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useApplyLoan, useLoanEligibility } from "../hooks/use-loans";
import { getLoanError } from "../loan-errors";
import { APPLY_LOAN_FIELDS, applyLoanSchema, toApplyLoanPayload, type ApplyLoanInput } from "../schemas";

type LoanApplyDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Opens the new loan's details after saving. */
  onApplied: (loanNo: string) => void;
};

// POST /loans/apply: a new application for an active member, up to what the
// backend says they may borrow. The schedule is made at disbursement.
// The parent passes a new `key` each time it opens.
export function LoanApplyDialog({ open, onClose, onApplied }: LoanApplyDialogProps) {
  const t = useTranslations("Loans");
  const tErrors = useTranslations("LoanErrors");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const applyLoan = useApplyLoan();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLoanInput>({
    resolver: zodResolver(applyLoanSchema(t)),
    defaultValues: { memberNo: "", principal: "", interestRatePercent: "", tenureMonths: "" },
    mode: "onTouched",
  });

  const memberNoInput = useWatch({ control, name: "memberNo" });
  const lookupNo = useDebouncedValue(memberNoInput.trim());
  const lookup = useMemberLookup(lookupNo);
  const member = lookup.data;
  const activeMemberNo = member?.status === "active" ? member.memberNo : "";
  const balances = useMemberBalances(activeMemberNo);
  const eligibility = useLoanEligibility(activeMemberNo);
  const loanLimit = useSetting(activeMemberNo ? "loan_limit_percent" : "");

  const isLooking = !!lookupNo && (lookup.isPending || lookupNo !== memberNoInput.trim());
  const isNotFound = !isLooking && (lookup.error?.status === 404 || lookup.error?.status === 400);
  const isMemberBlocked = isNotFound || (!!member && member.status !== "active");
  const hasOpenLoan = (eligibility.data?.currentOutstandingLoan ?? 0) > 0;
  const isBusy = isSubmitting || applyLoan.isPending;
  const limitText = loanLimit.data?.value
    ? t("eligibleHint", { percent: new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN").format(Number(loanLimit.data.value)) })
    : "";

  const save = async (values: ApplyLoanInput) => {
    setFormError(null);
    try {
      const loan = await applyLoan.mutateAsync(toApplyLoanPayload(values));
      toast.success(t("applied", { loanNo: loan.loanNo }));
      onApplied(loan.loanNo);
    } catch (error) {
      const result = getLoanError(error, tErrors, tCollections, locale, APPLY_LOAN_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof ApplyLoanInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: ApplyLoanInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof ApplyLoanInput) => ({
    id: `loan-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `loan-${name}-error` : undefined,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("applyTitle")}
      description={t("applyDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("saving") : t("apply")}
          isBusy={isBusy}
          actionDisabled={isMemberBlocked}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <FormField id="loan-memberNo" label={t("fields.memberNo")} error={errors.memberNo?.message}>
        <Input
          {...fieldProps("memberNo")}
          {...register("memberNo")}
          autoComplete="off"
          autoCapitalize="characters"
          readOnly={isBusy}
          placeholder={t("fields.memberNoPlaceholder")}
          className="min-h-11 font-mono"
          data-autofocus
        />
        <MemberPreview isLooking={isLooking} isNotFound={isNotFound} member={member} balances={balances.data} />
      </FormField>

      {eligibility.data && (
        <div className="grid gap-3 rounded-xl bg-app-surface-muted/60 p-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-app-text-muted">{t("eligible")}</p>
            <Money paisa={eligibility.data.eligibleAmount} className="text-lg font-bold text-emerald-700" />
            {limitText && <p className="text-[11px] text-app-text-muted">{limitText}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-app-text-muted">{t("outstanding")}</p>
            <Money paisa={eligibility.data.currentOutstandingLoan} className="text-lg font-bold text-app-text" />
          </div>
        </div>
      )}
      {hasOpenLoan && <FormAlert message={t("hasOutstanding")} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="loan-principal" label={t("fields.principal")} error={errors.principal?.message}>
          <Input
            {...fieldProps("principal")}
            {...register("principal")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            placeholder="0.00"
            className="min-h-11 text-right text-base font-semibold tabular-nums"
          />
        </FormField>
        <FormField id="loan-interestRatePercent" label={t("fields.rate")} error={errors.interestRatePercent?.message}>
          <Input
            {...fieldProps("interestRatePercent")}
            {...register("interestRatePercent")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            placeholder="10"
            className="min-h-11 text-right tabular-nums"
          />
        </FormField>
        <FormField id="loan-tenureMonths" label={t("fields.tenure")} error={errors.tenureMonths?.message}>
          <Input
            {...fieldProps("tenureMonths")}
            {...register("tenureMonths")}
            inputMode="numeric"
            autoComplete="off"
            readOnly={isBusy}
            placeholder="12"
            className="min-h-11 text-right tabular-nums"
          />
        </FormField>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-900">
        <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t("applyNote")}
      </p>
    </Dialog>
  );
}
