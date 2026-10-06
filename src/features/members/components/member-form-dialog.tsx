"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Info, TriangleAlert } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getMemberFormErrors } from "../member-form-errors";
import { useCreateMember } from "../hooks/use-create-member";
import { useUpdateMember } from "../hooks/use-update-member";
import {
  createMemberSchema,
  findClearedFields,
  toCreateMemberPayload,
  toMemberFormValues,
  toUpdateMemberPayload,
  type CreateMemberInput,
} from "../schemas";
import type { Member } from "../types";

import { MemberFormFields } from "./member-form-fields";

type MemberFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Given = edit this member. Not given = add a new member. */
  member?: Member | null;
  /** Gets the saved member, e.g. so Member details shows the new data. */
  onSaved?: (member: Member) => void;
};

// Which NID the backend said already has a membership (409), and its numbers.
type Duplicate = { nid: string; memberNos: string };

// One form for "Add member" and "Edit member".
// The parent passes a new `key` each time it opens, so the form starts fresh.
export function MemberFormDialog({ open, onClose, member, onSaved }: MemberFormDialogProps) {
  const t = useTranslations("MemberForm");
  const tAddress = useTranslations("Address");
  const tNominee = useTranslations("Nominees");
  const toast = useToast();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEdit = !!member;
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<CreateMemberInput>({
    // Add: the first nominee is part of the form. Edit: nominees have their own dialog.
    resolver: zodResolver(createMemberSchema({ t, tAddress, tNominee, withNominee: !isEdit })),
    defaultValues: toMemberFormValues(member ?? undefined),
    mode: "onTouched",
  });

  // Busy while RHF submits OR the request is still running. isSubmitting alone
  // flips back to false when a blocked double-submit finishes early.
  const isBusy = isSubmitting || createMember.isPending || updateMember.isPending;
  // The warning only applies to the NID it was about. Edit the NID and it goes away.
  const currentNid = useWatch({ control, name: "nid" }).trim();
  const isConfirmingDuplicate = !!duplicate && duplicate.nid === currentNid;

  const copyPresentAddress = () =>
    setValue("permanentAddress", getValues("presentAddress"), { shouldDirty: true, shouldValidate: true });

  const saveMember = (values: CreateMemberInput) => {
    if (member) {
      const payload = toUpdateMemberPayload(values, dirtyFields);
      return updateMember.mutateAsync({ memberNo: member.memberNo, payload });
    }
    const confirmExtraMembership = duplicate?.nid === values.nid.trim();
    return createMember.mutateAsync({
      ...toCreateMemberPayload(values),
      ...(confirmExtraMembership && { confirmExtraMembership: true }),
    });
  };

  const save = async (values: CreateMemberInput) => {
    setFormError(null);

    const clearedFields = member ? findClearedFields(member, values) : [];
    if (clearedFields.length > 0) {
      clearedFields.forEach((field, index) => {
        setError(field, { type: "manual", message: t("validation.cannotClear") }, { shouldFocus: index === 0 });
      });
      return;
    }

    try {
      const saved = await saveMember(values);
      onSaved?.(saved);
      onClose();
      toast.success(t(isEdit ? "editSuccess" : "success", { memberNo: saved.memberNo }));
    } catch (error) {
      const result = getMemberFormErrors(error, t, isEdit ? "errors.editGeneric" : "errors.generic");
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
      if (result.duplicateMemberNos) {
        setDuplicate({ nid: values.nid.trim(), memberNos: result.duplicateMemberNos });
      }
    }
  };

  const onSubmit = (values: CreateMemberInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  const title = isEdit ? t("editTitle") : t("title");
  const description = isEdit ? t("editDescription") : t("description");
  const idleLabel = isEdit ? t("editSubmit") : isConfirmingDuplicate ? t("duplicate.confirm") : t("submit");
  const busyLabel = isEdit ? t("editSubmitting") : t("submitting");
  const submitLabel = isBusy ? busyLabel : idleLabel;
  // Edit: nothing to save until something changed (the backend needs 1+ field).
  const isSubmitDisabled = isEdit && !isDirty;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
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

      {isConfirmingDuplicate && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold">{t("duplicate.title")}</p>
            <p className="mt-0.5">{t("duplicate.body", { memberNos: duplicate.memberNos })}</p>
          </div>
        </div>
      )}

      <MemberFormFields
        register={register}
        control={control}
        errors={errors}
        readOnly={isBusy}
        showNominee={!isEdit}
        onCopyPresentAddress={copyPresentAddress}
      />

      {!isEdit && (
        <p className="flex items-start gap-2 rounded-xl bg-app-surface-muted/70 p-3 text-xs text-app-text-muted">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("loginNote")}
        </p>
      )}
    </Dialog>
  );
}
