"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateCashAccount } from "../hooks/use-collection-mutations";
import type { CashAccountKind } from "../types";

import { FormAlert } from "@/components/shared/form-alert";

type CashAccountDialogProps = { open: boolean; onClose: () => void };
type FieldErrors = { name?: string; bankName?: string };

// POST /cash-accounts/create (super admin). The parent passes a new `key` each time it opens.
export function CashAccountDialog({ open, onClose }: CashAccountDialogProps) {
  const t = useTranslations("CashAccountForm");
  const tCollections = useTranslations("Collections");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const createAccount = useCreateCashAccount();
  const runLocked = useSubmitLock();

  const [name, setName] = useState("");
  const [accountKind, setAccountKind] = useState<CashAccountKind>("bank");
  const [bankName, setBankName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = createAccount.isPending;
  const isBank = accountKind === "bank";
  const kindOptions = [
    { value: "bank", label: tCollections("kind.bank") },
    { value: "cash", label: tCollections("kind.cash") },
  ];

  // Same rules as the backend createCashAccountZodSchema.
  const validate = (): FieldErrors => {
    const trimmed = name.trim();
    return {
      ...(trimmed.length < 2 && { name: t("validation.nameShort") }),
      ...(trimmed.length > 50 && { name: t("validation.nameLong") }),
      ...(isBank && !bankName.trim() && { bankName: t("validation.bankName") }),
    };
  };

  const save = async () => {
    setFormError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const created = await createAccount.mutateAsync({
        name: name.trim(),
        accountKind,
        ...(isBank && { bankName: bankName.trim() }),
      });
      onClose();
      toast.success(t("success", { name: created.name }));
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, ["name", "bankName"]);
      setFieldErrors(Object.fromEntries(result.fieldErrors.map(({ field, message }) => [field, message])));
      setFormError(result.formError);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLocked(save);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("submitting") : t("submit")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

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

      <FormField id="account-name" label={t("name")} error={fieldErrors.name}>
        <Input
          id="account-name"
          value={name}
          maxLength={50}
          readOnly={isBusy}
          error={!!fieldErrors.name}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "account-name-error" : undefined}
          placeholder={t("namePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          className="min-h-11"
          data-autofocus
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
          />
        </FormField>
      )}
    </Dialog>
  );
}
