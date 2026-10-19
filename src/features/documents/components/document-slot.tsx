"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { checkImageFile, getDocumentError } from "../document-errors";
import { useUploadDocument } from "../hooks/use-document-mutations";
import { ALLOWED_IMAGE_TYPES, type DocumentKind, type DocumentOwner, type StoredFileInfo } from "../types";

import { DocumentImage } from "./document-image";

type DocumentSlotProps = {
  owner: DocumentOwner;
  kind: DocumentKind;
  label: string;
  file?: StoredFileInfo;
  canUpload: boolean;
  canRemove: boolean;
  onView: () => void;
  onRemove: () => void;
};

const ACTION =
  "inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-app-border px-2 text-xs font-semibold text-app-text transition-colors hover:bg-app-surface-muted focus-visible:outline-2 focus-visible:outline-app-focus disabled:cursor-not-allowed disabled:opacity-50";

// One image slot (photo / NID front / NID back / signature): the thumbnail
// (tap = full size), when it was uploaded, and Upload/Replace/Remove when allowed.
export function DocumentSlot({ owner, kind, label, file, canUpload, canRemove, onView, onRemove }: DocumentSlotProps) {
  const t = useTranslations("Documents");
  const format = useFormatter();
  const toast = useToast();
  const upload = useUploadDocument(owner);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isUploading = upload.isPending;

  const pickFile = () => inputRef.current?.click();

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = ""; // the same file can be chosen again after an error
    if (!chosen) return;

    // Wrong type / too big: answer at once, nothing is sent
    const problem = checkImageFile(chosen, t);
    setError(problem);
    if (problem) return;

    try {
      await upload.mutateAsync({ kind, file: chosen });
      toast.success(t("uploadSuccess", { name: label }));
    } catch (uploadError) {
      setError(getDocumentError(uploadError, t, "errors.generic"));
    }
  };

  return (
    <figure className="flex min-w-0 flex-col gap-2 rounded-xl border border-app-border bg-app-surface p-2">
      <figcaption className="truncate px-0.5 text-xs font-semibold text-app-text">{label}</figcaption>

      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-app-surface-muted">
        {file ? (
          <button
            type="button"
            onClick={onView}
            aria-label={t("view", { name: label })}
            className="block h-full w-full focus-visible:outline-2 focus-visible:outline-app-focus"
          >
            <DocumentImage owner={owner} kind={kind} file={file} size="thumb" alt={label} />
          </button>
        ) : (
          <span className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-app-text-muted">
            {t("empty")}
          </span>
        )}
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-app-surface/80 text-xs font-semibold text-app-text">
            {t("uploading")}
          </span>
        )}
      </div>

      {file && (
        <p className="truncate px-0.5 text-[11px] text-app-text-muted">
          {t("uploadedAt", {
            date: format.dateTime(new Date(file.uploadedAt), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }),
          })}
        </p>
      )}

      {error && (
        <p role="alert" className="px-0.5 text-xs text-red-700">
          {error}
        </p>
      )}

      {(canUpload || (canRemove && file)) && (
        <div className="flex gap-1.5">
          {canUpload && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => void onFileChosen(event)}
              />
              <button
                type="button"
                onClick={pickFile}
                disabled={isUploading}
                aria-label={file ? t("replaceFor", { name: label }) : t("uploadFor", { name: label })}
                className={ACTION}
              >
                {file ? <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" /> : <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />}
                {file ? t("replace") : t("upload")}
              </button>
            </>
          )}
          {canRemove && file && (
            <button
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              aria-label={t("removeFor", { name: label })}
              title={t("remove")}
              className={cn(ACTION, "flex-none px-2.5 hover:bg-red-50 hover:text-red-700")}
            >
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </figure>
  );
}
