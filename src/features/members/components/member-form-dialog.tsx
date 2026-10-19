"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Info, TriangleAlert } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { getDocumentError } from "@/features/documents/document-errors";
import { DOCUMENT_KINDS, type DocumentKind } from "@/features/documents/types";
import { ApiError } from "@/lib/api-errors";
import { useSubmitLock } from "@/lib/use-submit-lock";

import type { MemberFormFiles } from "../api";

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

import { MemberDocumentsField } from "./member-documents-field";
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

// Answers that are about the images, not the member fields
const FILE_ERROR_STATUSES = [413, 415, 502, 503];

// One form for "Add member" and "Edit member".
// The parent passes a new `key` each time it opens, so the form starts fresh.
export function MemberFormDialog({ open, onClose, member, onSaved }: MemberFormDialogProps) {
  const t = useTranslations("MemberForm");
  const tDocuments = useTranslations("Documents");
  const tAddress = useTranslations("Address");
  const tNominee = useTranslations("Nominees");
  const toast = useToast();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEdit = !!member;
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  // Images go with the form: chosen files, and saved images to remove (edit)
  const [files, setFiles] = useState<MemberFormFiles>({});
  const [removedDocuments, setRemovedDocuments] = useState<DocumentKind[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  // Replacing or removing saved images deletes them, so the save asks first
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // The form message sits at the top of a long form: bring it into view
  const formAlertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (formError) formAlertRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [formError]);

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

  const chosenKinds = DOCUMENT_KINDS.filter((kind) => files[kind]);
  const hasFiles = chosenKinds.length > 0;
  const hasImageChanges = hasFiles || removedDocuments.length > 0;
  // Saved images this save deletes (replaced or removed), for the confirm
  const deletedKinds = DOCUMENT_KINDS.filter(
    (kind) => !!member?.documents?.[kind] && (!!files[kind] || removedDocuments.includes(kind)),
  );
  const deletedNames = deletedKinds.map((kind) => tDocuments(`kinds.member.${kind}`)).join(", ");

  const copyPresentAddress = () =>
    setValue("permanentAddress", getValues("presentAddress"), { shouldDirty: true, shouldValidate: true });

  const saveMember = (values: CreateMemberInput) => {
    const upload = hasFiles ? { files, onUploadProgress: setUploadProgress } : {};
    if (member) {
      const payload = {
        ...toUpdateMemberPayload(values, dirtyFields),
        ...(removedDocuments.length > 0 && { removeDocuments: removedDocuments }),
      };
      return updateMember.mutateAsync({ memberNo: member.memberNo, payload, ...upload });
    }
    const confirmExtraMembership = duplicate?.nid === values.nid.trim();
    return createMember.mutateAsync({
      payload: {
        ...toCreateMemberPayload(values),
        ...(confirmExtraMembership && { confirmExtraMembership: true }),
      },
      ...upload,
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

    setUploadProgress(hasFiles ? 0 : null);
    try {
      const saved = await saveMember(values);
      setIsConfirmOpen(false);
      onSaved?.(saved);
      onClose();
      // Add: the member is saved first and the images after it. If the images
      // could not be saved, the member is still registered: say so, so the
      // office adds them from the details instead of registering again.
      const imagesMissing = !isEdit && chosenKinds.some((kind) => !saved.documents?.[kind]);
      if (imagesMissing) {
        toast.error(t("documents.savedWithoutImages", { memberNo: saved.memberNo }));
        return;
      }
      toast.success(t(isEdit ? "editSuccess" : "success", { memberNo: saved.memberNo }));
    } catch (error) {
      setIsConfirmOpen(false);
      setUploadProgress(null);
      // An image problem: nothing was saved (the backend deleted any upload again)
      if (hasFiles && error instanceof ApiError && FILE_ERROR_STATUSES.includes(error.status)) {
        setFormError(`${getDocumentError(error, tDocuments, "errors.generic")} ${t("documents.nothingSaved")}`);
        return;
      }
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

  const onSubmit = (values: CreateMemberInput) => {
    if (deletedKinds.length > 0 && !isConfirmOpen) {
      setIsConfirmOpen(true);
      return;
    }
    return runLocked(() => save(values));
  };
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const confirmImageChanges = () => void handleSubmit(onSubmit)();

  const title = isEdit ? t("editTitle") : t("title");
  const description = isEdit ? t("editDescription") : t("description");
  const idleLabel = isEdit ? t("editSubmit") : isConfirmingDuplicate ? t("duplicate.confirm") : t("submit");
  const busyLabel =
    uploadProgress !== null && uploadProgress < 100
      ? t("documents.uploading", { percent: uploadProgress })
      : isEdit
        ? t("editSubmitting")
        : t("submitting");
  const submitLabel = isBusy ? busyLabel : idleLabel;
  // Edit: nothing to save until something changed (a field or an image).
  const isSubmitDisabled = isEdit && !isDirty && !hasImageChanges;

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
      <div ref={formAlertRef}>{formError && <FormAlert message={formError} />}</div>

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

      <MemberDocumentsField
        owner={member ? { type: "member", memberNo: member.memberNo } : undefined}
        existing={member?.documents}
        files={files}
        removed={removedDocuments}
        onFilesChange={setFiles}
        onRemovedChange={setRemovedDocuments}
        disabled={isBusy}
      />

      {isBusy && uploadProgress !== null && (
        <div role="status" className="space-y-1.5 rounded-xl border border-app-border bg-app-surface-muted/50 p-3">
          <p className="text-xs font-medium text-app-text">
            {uploadProgress < 100 ? t("documents.uploading", { percent: uploadProgress }) : t("documents.saving")}
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-app-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress}
          >
            <div
              className="h-full rounded-full bg-app-primary transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {!isEdit && (
        <p className="flex items-start gap-2 rounded-xl bg-app-surface-muted/70 p-3 text-xs text-app-text-muted">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("loginNote")}
        </p>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirmImageChanges}
        title={t("documents.confirmTitle", { count: deletedKinds.length })}
        description={t("documents.confirmDescription", { names: deletedNames })}
        cancelLabel={t("cancel")}
        confirmLabel={t("editSubmit")}
        busyLabel={busyLabel}
        isBusy={isBusy}
      />
    </Dialog>
  );
}
