"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { getCollectionError } from "@/features/collections/collection-errors";
import type { HeadKind } from "@/features/collections/types";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useCreateLedgerHead, useUpdateLedgerHead } from "../hooks/use-ledger-head-mutations";
import {
  LEDGER_HEAD_FIELDS,
  ledgerHeadSchema,
  toCreateLedgerHeadPayload,
  toUpdateLedgerHeadPayload,
  type LedgerHeadInput,
} from "../schemas";
import { HEAD_KINDS, HEAD_ROLES, SECTIONS_BY_KIND, type LedgerHead } from "../types";

type LedgerHeadDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Given: edit this head. Missing: add a new one of `defaultKind`. */
  head?: LedgerHead;
  defaultKind: HeadKind;
};

// Duplicate key from the global error handler: "<name> already exists!!".
// Only the Bangla name is unique on a head.
const DUPLICATE = /already exists!*$/i;

// Add or edit a ledger head (super admin). The kind is fixed after create.
// The parent passes a new `key` each time it opens.
export function LedgerHeadDialog({ open, onClose, head, defaultKind }: LedgerHeadDialogProps) {
  const t = useTranslations("LedgerHeads");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const createHead = useCreateLedgerHead();
  const updateHead = useUpdateLedgerHead();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!head;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LedgerHeadInput>({
    resolver: zodResolver(ledgerHeadSchema(t)),
    defaultValues: {
      nameBn: head?.nameBn ?? "",
      nameEn: head?.nameEn ?? "",
      kind: head?.kind ?? defaultKind,
      section: head?.section ?? "",
      role: head?.role ?? "",
      displayOrder: head ? String(head.displayOrder) : "",
    },
    mode: "onTouched",
  });

  const kind = useWatch({ control, name: "kind" }) as HeadKind;
  const sections = SECTIONS_BY_KIND[kind] ?? [];
  const isBusy = isSubmitting || createHead.isPending || updateHead.isPending;
  const kindOptions = HEAD_KINDS.map((value) => ({ value, label: t(`kinds.${value}`) }));
  const sectionOptions = sections.map((value) => ({ value, label: t(`sections.${value}`) }));
  const isFund = kind === "fund";
  const roleOptions = [
    { value: "", label: t("roles.none") },
    ...HEAD_ROLES.map((value) => ({ value, label: t(`roles.${value}`) })),
  ];

  const showError = (error: unknown) => {
    if (error instanceof Error && DUPLICATE.test(error.message)) {
      setError("nameBn", { type: "server", message: t("validation.nameTaken") }, { shouldFocus: true });
      return;
    }
    const result = getCollectionError(error, tErrors, locale, LEDGER_HEAD_FIELDS);
    result.fieldErrors.forEach(({ field, message }, index) => {
      setError(field as keyof LedgerHeadInput, { type: "server", message }, { shouldFocus: index === 0 });
    });
    setFormError(result.formError);
  };

  const save = async (values: LedgerHeadInput) => {
    setFormError(null);
    try {
      if (head) {
        const payload = toUpdateLedgerHeadPayload(values, head);
        if (Object.keys(payload).length > 0) await updateHead.mutateAsync({ id: head._id, payload });
        toast.success(t("updated", { name: values.nameBn.trim() }));
      } else {
        const created = await createHead.mutateAsync(toCreateLedgerHeadPayload(values));
        toast.success(t("created", { name: created.nameBn }));
      }
      onClose();
    } catch (error) {
      showError(error);
    }
  };

  const onSubmit = (values: LedgerHeadInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof LedgerHeadInput) => ({
    id: `head-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `head-${name}-error` : undefined,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("addTitle")}
      description={isEdit ? t("editDescription") : t("addDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("saving") : isEdit ? t("saveChanges") : t("add")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <FormField id="head-kind" label={t("fields.kind")} error={errors.kind?.message}>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <SelectMenu
              id="head-kind"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={kindOptions}
              disabled={isBusy || isEdit}
              error={!!errors.kind}
            />
          )}
        />
        {isEdit && <p className="mt-1.5 text-xs text-app-text-muted">{t("kindFixed")}</p>}
      </FormField>

      <FormField id="head-nameBn" label={t("fields.nameBn")} error={errors.nameBn?.message}>
        <Input
          {...fieldProps("nameBn")}
          {...register("nameBn")}
          maxLength={60}
          readOnly={isBusy}
          placeholder={t("fields.nameBnPlaceholder")}
          className="min-h-11"
          data-autofocus
        />
      </FormField>

      <FormField id="head-nameEn" label={t("fields.nameEn")} labelHint={t("optional")} error={errors.nameEn?.message}>
        <Input {...fieldProps("nameEn")} {...register("nameEn")} maxLength={60} readOnly={isBusy} className="min-h-11" />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.length > 0 && (
          <FormField id="head-section" label={t("fields.section")} error={errors.section?.message}>
            <Controller
              control={control}
              name="section"
              render={({ field }) => (
                <SelectMenu
                  id="head-section"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={sectionOptions}
                  placeholder={t("fields.sectionPlaceholder")}
                  disabled={isBusy}
                  error={!!errors.section}
                  aria-describedby={errors.section ? "head-section-error" : undefined}
                />
              )}
            />
          </FormField>
        )}
        <FormField
          id="head-displayOrder"
          label={t("fields.displayOrder")}
          labelHint={t("optional")}
          error={errors.displayOrder?.message}
        >
          <Input
            {...fieldProps("displayOrder")}
            {...register("displayOrder")}
            inputMode="numeric"
            readOnly={isBusy}
            placeholder="0"
            className="min-h-11"
          />
        </FormField>
      </div>
      <p className="text-xs text-app-text-muted">{t("orderHint")}</p>

      {isFund && (
        <FormField id="head-role" label={t("fields.role")} labelHint={t("optional")} error={errors.role?.message}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <SelectMenu
                id="head-role"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={roleOptions}
                disabled={isBusy}
                error={!!errors.role}
              />
            )}
          />
          <p className="mt-1.5 text-xs text-app-text-muted">{t("roleHint")}</p>
        </FormField>
      )}
    </Dialog>
  );
}
