"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectMenu } from "@/components/ui/select-menu";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateCashAccount, useUpdateCashAccount } from "../hooks/use-collection-mutations";
import { BANK_ACCOUNT_TYPES, type BankAccountType, type CashAccount, type CashAccountKind } from "../types";

import { FormAlert } from "@/components/shared/form-alert";

type CashAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Edit this bank account's bank name and type. Without it: add a new account. */
  account?: CashAccount;
};
type FieldErrors = { name?: string; bankName?: string; bankAccountType?: string };

// Add: POST /cash-accounts/create. Edit (bank accounts): PATCH /cash-accounts/update/:id,
// where only the bank name and the type (savings / FDR / current) can change.
// Super admin only. The parent passes a new `key` each time it opens.
export function CashAccountDialog({ open, onClose, account }: CashAccountDialogProps) {
  const t = useTranslations("CashAccountForm");
  const tCollections = useTranslations("Collections");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const createAccount = useCreateCashAccount();
  const updateAccount = useUpdateCashAccount();
  const runLocked = useSubmitLock();
  const isEdit = !!account;

  const [name, setName] = useState(account?.name ?? "");
  const [accountKind, setAccountKind] = useState<CashAccountKind>(account?.accountKind ?? "bank");
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [bankAccountType, setBankAccountType] = useState<BankAccountType | "">(account?.bankAccountType ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = createAccount.isPending || updateAccount.isPending;
  const isBank = accountKind === "bank";
  const kindOptions = [
    { value: "bank", label: tCollections("kind.bank") },
    { value: "cash", label: tCollections("kind.cash") },
  ];
  const typeOptions = BANK_ACCOUNT_TYPES.map((type) => ({ value: type, label: tCollections(`bankType.${type}`) }));

  // Same rules as the backend create / update schemas.
  const validate = (): FieldErrors => {
    const trimmed = name.trim();
    return {
      ...(!isEdit && trimmed.length < 2 && { name: t("validation.nameShort") }),
      ...(!isEdit && trimmed.length > 50 && { name: t("validation.nameLong") }),
      ...(isBank && !bankName.trim() && { bankName: t("validation.bankName") }),
      ...(isBank && !bankAccountType && { bankAccountType: t("validation.bankAccountType") }),
    };
  };

  const saveAccount = async () => {
    if (account) {
      return updateAccount.mutateAsync({
        id: account._id,
        payload: { bankName: bankName.trim(), ...(bankAccountType && { bankAccountType }) },
      });
    }
    return createAccount.mutateAsync({
      name: name.trim(),
      accountKind,
      ...(isBank && { bankName: bankName.trim() }),
      ...(isBank && bankAccountType && { bankAccountType }),
    });
  };

  const save = async () => {
    setFormError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const saved = await saveAccount();
      onClose();
      toast.success(t(isEdit ? "editSuccess" : "success", { name: saved.name }));
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, ["name", "bankName", "bankAccountType"]);
      setFieldErrors(Object.fromEntries(result.fieldErrors.map(({ field, message }) => [field, message])));
      setFormError(result.formError);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLocked(save);
  };

  const idleLabel = isEdit ? t("editSubmit") : t("submit");
  const busyLabel = isEdit ? t("editSubmitting") : t("submitting");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("title")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? busyLabel : idleLabel}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      {!isEdit && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-app-text">{t("kind")}</p>
          <SegmentedControl
            aria-label={t("kind")}
            value={accountKind}
            onChange={(kind) => setAccountKind(kind as CashAccountKind)}
            options={kindOptions}
            disabled={isBusy}
            fullWidth
          />
        </div>
      )}

      <FormField id="account-name" label={t("name")} error={fieldErrors.name}>
        <Input
          id="account-name"
          value={name}
          maxLength={50}
          readOnly={isBusy || isEdit}
          disabled={isEdit}
          error={!!fieldErrors.name}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "account-name-error" : undefined}
          placeholder={t("namePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          className="min-h-11"
          {...(!isEdit && { "data-autofocus": true })}
        />
      </FormField>

      {isBank && (
        <FormField id="account-bankName" label={t("bankName")} error={fieldErrors.bankName}>
          <Input
            id="account-bankName"
            value={bankName}
            maxLength={50}
            readOnly={isBusy}
            error={!!fieldErrors.bankName}
            aria-invalid={!!fieldErrors.bankName}
            aria-describedby={fieldErrors.bankName ? "account-bankName-error" : undefined}
            onChange={(event) => setBankName(event.target.value)}
            className="min-h-11"
            {...(isEdit && { "data-autofocus": true })}
          />
        </FormField>
      )}

      {isBank && (
        <FormField id="account-bankAccountType" label={t("bankAccountType")} error={fieldErrors.bankAccountType}>
          <SelectMenu
            id="account-bankAccountType"
            value={bankAccountType}
            onChange={(type) => setBankAccountType(type as BankAccountType)}
            options={typeOptions}
            placeholder={t("bankAccountTypePlaceholder")}
            disabled={isBusy}
            error={!!fieldErrors.bankAccountType}
          />
        </FormField>
      )}
    </Dialog>
  );
}
