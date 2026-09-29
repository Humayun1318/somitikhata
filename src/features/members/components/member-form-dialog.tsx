"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCreateMemberErrors } from "../create-member-errors";
import { useCreateMember } from "../hooks/use-create-member";
import {
  createMemberSchema,
  todayDateString,
  toCreateMemberPayload,
  type CreateMemberInput,
} from "../schemas";

import { AddMemberFields } from "./add-member-fields";

type AddMemberDialogProps = {
  open: boolean;
  onClose: () => void;
};

// Which NID the backend said already has a membership (409), and its numbers.
type Duplicate = { nid: string; memberNos: string };

// The parent passes a new `key` each time it opens, so the form starts empty.
export function AddMemberDialog({ open, onClose }: AddMemberDialogProps) {
  const t = useTranslations("AddMember");
  const toast = useToast();
  const createMember = useCreateMember();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema(t)),
    defaultValues: {
      nameBn: "",
      nameEn: "",
      guardianName: "",
      guardianRelation: "",
      phone: "",
      nid: "",
      dob: "",
      joinDate: todayDateString(),
      admissionFormNo: "",
    },
    mode: "onTouched",
  });

  // Busy while RHF submits OR the request is still running. isSubmitting alone
  // flips back to false when a blocked double-submit finishes early.
  const isBusy = isSubmitting || createMember.isPending;
  // The warning only applies to the NID it was about. Edit the NID and it goes away.
  const currentNid = useWatch({ control, name: "nid" }).trim();
  const isConfirmingDuplicate = !!duplicate && duplicate.nid === currentNid;

  const create = async (values: CreateMemberInput) => {
    setFormError(null);
    const confirmExtraMembership = duplicate?.nid === values.nid.trim();

    try {
      const member = await createMember.mutateAsync({
        ...toCreateMemberPayload(values),
        ...(confirmExtraMembership && { confirmExtraMembership: true }),
      });
      onClose();
      toast.success(t("success", { memberNo: member.memberNo }));
    } catch (error) {
      const result = getCreateMemberErrors(error, t);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
      if (result.duplicateMemberNos) {
        setDuplicate({ nid: values.nid.trim(), memberNos: result.duplicateMemberNos });
      }
    }
  };

  const onSubmit = (values: CreateMemberInput) => runLocked(() => create(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  const idleLabel = isConfirmingDuplicate ? t("duplicate.confirm") : t("submit");
  const submitLabel = isBusy ? t("submitting") : idleLabel;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
    >
      <form onSubmit={submitForm} noValidate aria-busy={isBusy} className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

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

        <AddMemberFields register={register} errors={errors} readOnly={isBusy} />

        <p className="flex items-start gap-2 rounded-xl bg-app-surface-muted/70 p-3 text-xs text-app-text-muted">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("loginNote")}
        </p>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isBusy} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
