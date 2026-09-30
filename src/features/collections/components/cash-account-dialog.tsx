"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
    <Dialog open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} dismissible={!isBusy}>
      <form onSubmit={submitForm} noValidate aria-busy={isBusy} className="space-y-4">
        {formError && <FormAlert message={formError} />}

        <FormField id="account-kind" label={t("kind")}>
          <Select
            id="account-kind"
            value={accountKind}
            disabled={isBusy}
            onChange={(event) => setAccountKind(event.target.value as CashAccountKind)}
            className="min-h-11"
          >
            <option value="bank">{tCollections("kind.bank")}</option>
            <option value="cash">{tCollections("kind.cash")}</option>
          </Select>
        </FormField>

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

        <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isBusy} className="w-full sm:w-auto">
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isBusy} className="w-full sm:w-auto">
            {isBusy ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
