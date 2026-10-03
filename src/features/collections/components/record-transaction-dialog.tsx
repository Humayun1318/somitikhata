"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa, takaToPaisa, TAKA_INPUT_PATTERN } from "@/lib/money";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateTransaction } from "../hooks/use-collection-mutations";
import { useSetting } from "@/features/settings/hooks/use-settings";

import {
  useCashAccounts,
  useMemberBalances,
  useMemberLookup,
  type TransactionTypeCatalog,
} from "../hooks/use-collection-queries";
import type { RecordDefaults } from "../hooks/use-transaction-dialogs";
import {
  RECORD_FIELDS,
  recordTransactionSchema,
  toCreateTransactionPayload,
  type RecordTransactionInput,
} from "../schemas";
import { balanceOf, typeName } from "../transaction-effects";

import { FormAlert } from "@/components/shared/form-alert";
import { MemberPreview } from "./member-preview";

type RecordTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  catalog: TransactionTypeCatalog;
  defaults: RecordDefaults;
};

// Backend SYSTEM_TYPE_CODES. One share value per member: a Share Deposit only
// without a share, a Share Refund only with one (and always in full).
const SHARE_DEPOSIT_CODE = "SHARE_DEPOSIT";
const SHARE_REFUND_CODE = "SHARE_REFUND";

// POST /transactions/create: one member deposit or withdrawal.
// The parent passes a new `key` each time it opens, so the form starts fresh.
export function RecordTransactionDialog({ open, onClose, catalog, defaults }: RecordTransactionDialogProps) {
  const t = useTranslations("TransactionForm");
  const tErrors = useTranslations("CollectionErrors");
  const tBucket = useTranslations("Collections.buckets");
  const locale = useLocale();
  const toast = useToast();
  const createTransaction = useCreateTransaction();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecordTransactionInput>({
    resolver: zodResolver(recordTransactionSchema(t)),
    defaultValues: {
      memberNo: defaults.memberNo ?? "",
      typeCode: "",
      cashAccountId: defaults.cashAccountId ?? "",
      amount: "",
      transactionDate: toDhakaDateString(),
      voucherNo: "",
      description: "",
    },
    mode: "onTouched",
  });

  const [memberNoInput, typeCode, cashAccountId, amount] = useWatch({
    control,
    name: ["memberNo", "typeCode", "cashAccountId", "amount"],
  });

  // Look the member up once typing pauses.
  const lookupNo = useDebouncedValue(memberNoInput.trim());
  const lookup = useMemberLookup(lookupNo);
  const member = lookup.data;
  const balances = useMemberBalances(member?.status === "active" ? member.memberNo : "");
  const accounts = useCashAccounts();

  const memberTypes = catalog.types.filter(
    (type) =>
      (type.typeGroup === "member_deposit" || type.typeGroup === "member_withdrawal") &&
      type.cashEffect !== "none" &&
      type.memberRule === "required",
  );
  const depositTypes = memberTypes.filter((type) => type.typeGroup === "member_deposit");
  const withdrawalTypes = memberTypes.filter((type) => type.typeGroup === "member_withdrawal");
  const selectedType = memberTypes.find((type) => type.code === typeCode);
  const isWithdrawal = selectedType?.typeGroup === "member_withdrawal";
  const activeAccounts = (accounts.data ?? []).filter((account) => account.status === "active");
  const selectedAccount = activeAccounts.find((account) => account._id === cashAccountId);

  const limit = useSetting(isWithdrawal ? "withdrawal_limit_percent" : "");
  const withdrawnBuckets = isWithdrawal
    ? (selectedType?.memberEffects ?? []).filter((effect) => effect.sign === "minus").map((effect) => effect.bucket)
    : [];

  const numberFormat = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN");
  // Information only: the server applies the exact rule when saving.
  // Amanot: the % limit. Share and Fixed Amanot are refunds: up to the
  // balance, Share only in full, so those notes offer to fill the balance.
  const withdrawalNotes = withdrawnBuckets.map((bucket) => {
    const balance = balances.data ? balanceOf(balances.data, bucket) : undefined;
    const values = { bucket: tBucket(bucket), balance: balance === undefined ? "…" : formatPaisa(balance, locale) };
    const text =
      bucket === "amanot"
        ? t("withdrawalInfo", {
            ...values,
            percent: limit.data?.value ? numberFormat.format(Number(limit.data.value)) : "…",
          })
        : t(bucket === "share" ? "shareRefundInfo" : "refundInfo", values);
    const fillAmount = bucket !== "amanot" && balance !== undefined && balance > 0 ? String(balance / 100) : "";
    return { bucket, text, fillAmount };
  });

  const isLooking = !!lookupNo && (lookup.isPending || lookupNo !== memberNoInput.trim());
  // 404: no such member. 400: not a valid member number at all.
  const isNotFound = !isLooking && (lookup.error?.status === 404 || lookup.error?.status === 400);
  const isMemberBlocked = isNotFound || (!!member && member.status !== "active");
  const isBusy = isSubmitting || createTransaction.isPending;

  const amountText = amount.trim();
  const hasAmount = TAKA_INPUT_PATTERN.test(amountText) && Number(amountText) > 0;
  const showSummary = !!member && !!selectedType && !!selectedAccount && hasAmount;
  const summary = showSummary
    ? t("summary", {
        direction: t(isWithdrawal ? "groups.withdrawal" : "groups.deposit"),
        amount: formatPaisa(takaToPaisa(amountText), locale),
        type: typeName(selectedType, locale),
        memberNo: member.memberNo,
        account: selectedAccount.name,
      })
    : "";

  const save = async (values: RecordTransactionInput) => {
    setFormError(null);
    try {
      const created = await createTransaction.mutateAsync(toCreateTransactionPayload(values));
      onClose();
      toast.success(t("success", { transactionNo: created.transactionNo }));
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, RECORD_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof RecordTransactionInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: RecordTransactionInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof RecordTransactionInput) => ({
    id: `record-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `record-${name}-error` : undefined,
  });
  const isShareTaken = (code: string) => code === SHARE_DEPOSIT_CODE && !!member?.hasShareDeposit;
  const isNoShare = (code: string) => code === SHARE_REFUND_CODE && !!member && !member.hasShareDeposit;
  const fillAmount = (value: string) => setValue("amount", value, { shouldValidate: true, shouldDirty: true });
  const typeOptions = [
    ...depositTypes.map((type) => ({
      value: type.code,
      label: isShareTaken(type.code) ? t("shareTaken", { type: typeName(type, locale) }) : typeName(type, locale),
      group: t("groups.deposit"),
      disabled: isShareTaken(type.code),
    })),
    ...withdrawalTypes.map((type) => ({
      value: type.code,
      label: isNoShare(type.code) ? t("noShare", { type: typeName(type, locale) }) : typeName(type, locale),
      group: t("groups.withdrawal"),
      disabled: isNoShare(type.code),
    })),
  ];
  const accountOptions = activeAccounts.map((account) => ({ value: account._id, label: account.name }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("submitting") : t("submit")}
          isBusy={isBusy}
          actionDisabled={isMemberBlocked}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <FormField id="record-memberNo" label={t("fields.memberNo")} error={errors.memberNo?.message}>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="record-typeCode" label={t("fields.type")} error={errors.typeCode?.message}>
          <Controller
            control={control}
            name="typeCode"
            render={({ field }) => (
              <SelectMenu
                id="record-typeCode"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={typeOptions}
                placeholder={t("fields.typePlaceholder")}
                searchable={false}
                disabled={isBusy}
                error={!!errors.typeCode}
                aria-describedby={errors.typeCode ? "record-typeCode-error" : undefined}
              />
            )}
          />
        </FormField>

        <FormField id="record-cashAccountId" label={t("fields.account")} error={errors.cashAccountId?.message}>
          <Controller
            control={control}
            name="cashAccountId"
            render={({ field }) => (
              <SelectMenu
                id="record-cashAccountId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={accountOptions}
                placeholder={t("fields.accountPlaceholder")}
                disabled={isBusy}
                error={!!errors.cashAccountId}
                aria-describedby={errors.cashAccountId ? "record-cashAccountId-error" : undefined}
              />
            )}
          />
        </FormField>

        <FormField id="record-amount" label={t("fields.amount")} error={errors.amount?.message}>
          <Input
            {...fieldProps("amount")}
            {...register("amount")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            placeholder={t("fields.amountPlaceholder")}
            className="min-h-11 text-right text-base font-semibold tabular-nums"
          />
        </FormField>

        <FormField id="record-transactionDate" label={t("fields.date")} error={errors.transactionDate?.message}>
          <Input
            {...fieldProps("transactionDate")}
            {...register("transactionDate")}
            type="date"
            max={toDhakaDateString()}
            readOnly={isBusy}
            className="min-h-11"
          />
        </FormField>
      </div>

      {withdrawalNotes.map(({ bucket, text, fillAmount: amountText }) => (
        <div key={bucket} className="flex flex-wrap items-start gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-900">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1">{text}</span>
          {amountText && (
            <button
              type="button"
              onClick={() => fillAmount(amountText)}
              disabled={isBusy}
              className="font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950 disabled:opacity-50"
            >
              {t("useFullBalance")}
            </button>
          )}
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <FormField id="record-voucherNo" label={t("fields.voucherNo")} labelHint={t("fields.optional")} error={errors.voucherNo?.message}>
          <Input {...fieldProps("voucherNo")} {...register("voucherNo")} maxLength={30} readOnly={isBusy} className="min-h-11" />
        </FormField>
        <FormField id="record-description" label={t("fields.description")} labelHint={t("fields.optional")} error={errors.description?.message}>
          <Textarea {...fieldProps("description")} {...register("description")} rows={1} maxLength={200} readOnly={isBusy} className="min-h-11" />
        </FormField>
      </div>

      {showSummary && (
        <p className="rounded-xl border border-app-primary/30 bg-app-primary/5 p-3 text-sm font-medium text-app-text">
          {summary}
        </p>
      )}
    </Dialog>
  );
}
