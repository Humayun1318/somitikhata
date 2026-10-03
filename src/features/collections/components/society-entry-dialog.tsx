"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa, takaToPaisa, TAKA_INPUT_PATTERN } from "@/lib/money";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateSocietyEntry } from "../hooks/use-collection-mutations";
import { useCashAccounts, useHeadBalances, type TransactionTypeCatalog } from "../hooks/use-collection-queries";
import { SOCIETY_FIELDS, societyEntrySchema, toSocietyEntryPayload, type SocietyEntryInput } from "../schemas";
import { typeName } from "../transaction-effects";

/** The four kinds of samiti entry, one button each on the page. */
export type SocietyEntryKind = "income" | "expense" | "asset" | "liability";

type SocietyEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  kind: SocietyEntryKind;
  catalog: TransactionTypeCatalog;
  /** Pre-chosen head (the list is filtered by one). */
  defaultHeadId?: string;
};

// POST /transactions/society: one row that moves cash and one ledger head.
// Asset and liability have two directions (money out / money back), so the
// form starts with that choice. The parent passes a new `key` on each open.
export function SocietyEntryDialog({ open, onClose, kind, catalog, defaultHeadId }: SocietyEntryDialogProps) {
  const t = useTranslations("SocietyForm");
  const tForm = useTranslations("TransactionForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const createEntry = useCreateSocietyEntry();
  const runLocked = useSubmitLock();
  const accounts = useCashAccounts();
  const heads = useHeadBalances();
  const [formError, setFormError] = useState<string | null>(null);

  // This kind's types (one for income/expense, two for asset/liability)
  const kindTypes = catalog.types.filter(
    (type) => type.typeGroup === kind && !!type.headEffect && type.cashEffect !== "none",
  );
  const firstType = kindTypes[0]?.code ?? "";
  const headList = heads.data ?? [];
  const defaultHead = headList.find((head) => head._id === defaultHeadId && head.status === "active");

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SocietyEntryInput>({
    resolver: zodResolver(societyEntrySchema(tForm, t)),
    defaultValues: {
      typeCode: firstType,
      headId: defaultHead?.kind === kind ? defaultHead._id : "",
      cashAccountId: "",
      amount: "",
      transactionDate: toDhakaDateString(),
      voucherNo: "",
      description: "",
    },
    mode: "onTouched",
  });

  const [typeCode, headId, cashAccountId, amount] = useWatch({
    control,
    name: ["typeCode", "headId", "cashAccountId", "amount"],
  });
  const selectedType = kindTypes.find((type) => type.code === typeCode) ?? kindTypes[0];
  const isTakeOut = selectedType?.headEffect === "minus";
  const allowedKinds = selectedType?.headKinds ?? [];
  const activeHeads = headList.filter((head) => head.status === "active" && allowedKinds.includes(head.kind));
  const selectedHead = activeHeads.find((head) => head._id === headId);
  const activeAccounts = (accounts.data ?? []).filter((account) => account.status === "active");
  const selectedAccount = activeAccounts.find((account) => account._id === cashAccountId);
  const isBusy = isSubmitting || createEntry.isPending;
  const hasNoTypes = !catalog.isPending && kindTypes.length === 0;

  const directionOptions = kindTypes.map((type) => ({ value: type.code, label: t(`directions.${type.code}`) }));
  const headOptions = activeHeads.map((head) => ({ value: head._id, label: typeName(head, locale) }));
  const accountOptions = activeAccounts.map((account) => ({ value: account._id, label: account.name }));
  const headBalanceText =
    isTakeOut && selectedHead ? t("headBalance", { balance: formatPaisa(selectedHead.balance, locale) }) : "";

  const amountText = amount.trim();
  const hasAmount = TAKA_INPUT_PATTERN.test(amountText) && Number(amountText) > 0;
  const amountPaisa = hasAmount ? takaToPaisa(amountText) : 0;
  const cashSign = selectedType?.cashEffect === "in" ? amountPaisa : -amountPaisa;
  const headSign = isTakeOut ? -amountPaisa : amountPaisa;
  const summary =
    hasAmount && selectedHead && selectedAccount
      ? t("summary", {
          account: selectedAccount.name,
          cash: formatPaisa(cashSign, locale, { signed: true }),
          head: typeName(selectedHead, locale),
          headAmount: formatPaisa(headSign, locale, { signed: true }),
        })
      : "";

  // A direction change can make the chosen head the wrong kind: clear it.
  const changeDirection = (code: string) => {
    setValue("typeCode", code);
    setValue("headId", "");
  };

  const save = async (values: SocietyEntryInput) => {
    setFormError(null);
    try {
      const created = await createEntry.mutateAsync(toSocietyEntryPayload(values));
      onClose();
      toast.success(t("success", { transactionNo: created.transactionNo }));
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, SOCIETY_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof SocietyEntryInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: SocietyEntryInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof SocietyEntryInput) => ({
    id: `society-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `society-${name}-error` : undefined,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t(`titles.${kind}`)}
      description={t(`descriptions.${kind}`)}
      closeLabel={tForm("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={tForm("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? tForm("submitting") : t("submit")}
          isBusy={isBusy}
          actionDisabled={hasNoTypes}
        />
      }
    >
      {formError && <FormAlert message={formError} />}
      {hasNoTypes && <FormAlert message={t("noTypes")} />}

      {directionOptions.length > 1 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-app-text">{t("direction")}</p>
          <SegmentedControl
            aria-label={t("direction")}
            value={typeCode}
            onChange={changeDirection}
            options={directionOptions}
            disabled={isBusy}
            fullWidth
          />
        </div>
      )}

      <FormField id="society-headId" label={t("head")} error={errors.headId?.message}>
        <Controller
          control={control}
          name="headId"
          render={({ field }) => (
            <SelectMenu
              id="society-headId"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={headOptions}
              placeholder={heads.isPending ? t("headsLoading") : t("headPlaceholder")}
              disabled={isBusy}
              error={!!errors.headId}
              aria-describedby={errors.headId ? "society-headId-error" : undefined}
            />
          )}
        />
        {heads.isSuccess && headOptions.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-700">{t(`noHeads.${kind}`)}</p>
        )}
        {headBalanceText && <p className="mt-1.5 text-xs text-app-text-muted">{headBalanceText}</p>}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="society-cashAccountId" label={tForm("fields.account")} error={errors.cashAccountId?.message}>
          <Controller
            control={control}
            name="cashAccountId"
            render={({ field }) => (
              <SelectMenu
                id="society-cashAccountId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={accountOptions}
                placeholder={tForm("fields.accountPlaceholder")}
                disabled={isBusy}
                error={!!errors.cashAccountId}
                aria-describedby={errors.cashAccountId ? "society-cashAccountId-error" : undefined}
              />
            )}
          />
        </FormField>

        <FormField id="society-amount" label={tForm("fields.amount")} error={errors.amount?.message}>
          <Input
            {...fieldProps("amount")}
            {...register("amount")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            placeholder={tForm("fields.amountPlaceholder")}
            className="min-h-11 text-right text-base font-semibold tabular-nums"
          />
        </FormField>

        <FormField id="society-transactionDate" label={tForm("fields.date")} error={errors.transactionDate?.message}>
          <Input
            {...fieldProps("transactionDate")}
            {...register("transactionDate")}
            type="date"
            max={toDhakaDateString()}
            readOnly={isBusy}
            className="min-h-11"
          />
        </FormField>

        <FormField
          id="society-voucherNo"
          label={tForm("fields.voucherNo")}
          labelHint={tForm("fields.optional")}
          error={errors.voucherNo?.message}
        >
          <Input {...fieldProps("voucherNo")} {...register("voucherNo")} maxLength={30} readOnly={isBusy} className="min-h-11" />
        </FormField>
      </div>

      <FormField
        id="society-description"
        label={tForm("fields.description")}
        labelHint={tForm("fields.optional")}
        error={errors.description?.message}
      >
        <Textarea {...fieldProps("description")} {...register("description")} rows={2} maxLength={200} readOnly={isBusy} />
      </FormField>

      {kind === "asset" && (
        <p className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-900">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("assetNote")}
        </p>
      )}

      {summary && (
        <p className="rounded-xl border border-app-primary/30 bg-app-primary/5 p-3 text-sm font-medium text-app-text">
          {summary}
        </p>
      )}
    </Dialog>
  );
}
