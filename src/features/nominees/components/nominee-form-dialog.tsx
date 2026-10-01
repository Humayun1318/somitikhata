"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useCreateNominee, useUpdateNominee } from "../hooks/use-nominee-mutations";
import { getNomineeFormErrors } from "../nominee-form-errors";
import {
  findClearedNomineeFields,
  nomineeFormSchema,
  toNomineeFormValues,
  toNomineePayload,
  toUpdateNomineePayload,
  type NomineeFormInput,
} from "../schemas";
import type { Nominee } from "../types";

import { NomineeFormFields } from "./nominee-form-fields";

type NomineeFormDialogProps = {
  open: boolean;
  onClose: () => void;
  memberNo: string;
  /** Shown in the description, e.g. "রহিম উদ্দিন (LBKS-0001)". */
  memberLabel: string;
  /** Given = edit this nominee. Not given = add one. */
  nominee?: Nominee | null;
};

// Add or edit one nominee of a member. The parent passes a new `key` on each
// open, so the form starts fresh.
export function NomineeFormDialog({ open, onClose, memberNo, memberLabel, nominee }: NomineeFormDialogProps) {
  const t = useTranslations("Nominees");
  const tAddress = useTranslations("Address");
  const toast = useToast();
  const createNominee = useCreateNominee(memberNo);
  const updateNominee = useUpdateNominee(memberNo);
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!nominee;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NomineeFormInput>({
    resolver: zodResolver(nomineeFormSchema(t, tAddress)),
    defaultValues: { nominee: toNomineeFormValues(nominee ?? undefined) },
    mode: "onTouched",
  });

  const isBusy = isSubmitting || createNominee.isPending || updateNominee.isPending;

  const saveNominee = ({ nominee: values }: NomineeFormInput) => {
    if (nominee) return updateNominee.mutateAsync({ id: nominee._id, payload: toUpdateNomineePayload(values) });
    return createNominee.mutateAsync(toNomineePayload(values));
  };

  const save = async (values: NomineeFormInput) => {
    setFormError(null);

    const clearedFields = nominee ? findClearedNomineeFields(nominee, values.nominee) : [];
    if (clearedFields.length > 0) {
      clearedFields.forEach((field, index) => {
        setError(
          `nominee.${field}`,
          { type: "manual", message: t("validation.cannotClear") },
          { shouldFocus: index === 0 },
        );
      });
      return;
    }

    try {
      const saved = await saveNominee(values);
      onClose();
      toast.success(t(isEdit ? "form.editSuccess" : "form.addSuccess", { name: saved.name }));
    } catch (error) {
      const result = getNomineeFormErrors(error, t, isEdit ? "errors.editGeneric" : "errors.addGeneric");
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: NomineeFormInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    // This dialog can sit on top of the member details dialog: keep the submit here.
    event.stopPropagation();
    return handleSubmit(onSubmit)(event);
  };

  const idleLabel = isEdit ? t("form.editSubmit") : t("form.addSubmit");
  const submitLabel = isBusy ? t("form.saving") : idleLabel;
  // Edit: nothing to save until something changed.
  const isSubmitDisabled = isEdit && !isDirty;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? t("form.editTitle") : t("form.addTitle")}
      description={t("form.description", { member: memberLabel })}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={submitLabel}
          isBusy={isBusy}
          actionDisabled={isSubmitDisabled}
        />
      }
    >
      {formError && <FormAlert message={formError} />}
      <div className="space-y-5">
        <NomineeFormFields register={register} control={control} errors={errors.nominee} readOnly={isBusy} autoFocus />
      </div>
    </Dialog>
  );
}
