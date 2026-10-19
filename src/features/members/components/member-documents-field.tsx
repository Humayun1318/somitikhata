"use client";

import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, RefreshCw, RotateCcw, Trash2, X } from "lucide-react";

import { FormSection } from "@/components/shared/form-section";
import { DocumentImage } from "@/features/documents/components/document-image";
import { checkImageFile } from "@/features/documents/document-errors";
import { shrinkImageForUpload } from "@/features/documents/prepare-image";
import {
  ALLOWED_IMAGE_TYPES,
  DOCUMENT_KINDS,
  type DocumentKind,
  type DocumentOwner,
  type Documents,
} from "@/features/documents/types";
import { cn } from "@/lib/cn";

import type { MemberFormFiles } from "../api";

type MemberDocumentsFieldProps = {
  /** Edit: whose saved images to show. Add: not given. */
  owner?: DocumentOwner;
  /** Edit: the member's saved images. */
  existing?: Documents;
  /** Newly chosen images, by slot (sent with the form). */
  files: MemberFormFiles;
  /** Saved images marked for removal (removed when the form is saved). */
  removed: DocumentKind[];
  onFilesChange: Dispatch<SetStateAction<MemberFormFiles>>;
  onRemovedChange: Dispatch<SetStateAction<DocumentKind[]>>;
  disabled?: boolean;
};

const ACTION =
  "inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-app-border px-2 text-xs font-semibold text-app-text transition-colors hover:bg-app-surface-muted focus-visible:outline-2 focus-visible:outline-app-focus disabled:cursor-not-allowed disabled:opacity-50";

// Reads a chosen file for the preview (a data URL needs no cleanup)
const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Photo, NID both sides and signature inside the add / edit member form.
 * Nothing is uploaded here: the chosen images go with the form when it is
 * saved, and the backend stores them all or none together with the member.
 * Edit: the saved images are shown; each can be replaced or marked for
 * removal (undo until saved).
 */
export function MemberDocumentsField({
  owner,
  existing,
  files,
  removed,
  onFilesChange,
  onRemovedChange,
  disabled = false,
}: MemberDocumentsFieldProps) {
  const t = useTranslations("Documents");
  const tForm = useTranslations("MemberForm.documents");
  const [previews, setPreviews] = useState<Partial<Record<DocumentKind, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<DocumentKind, string>>>({});
  const [preparing, setPreparing] = useState<DocumentKind | null>(null);
  const inputs = useRef<Partial<Record<DocumentKind, HTMLInputElement | null>>>({});

  const setError = (kind: DocumentKind, message?: string) =>
    setErrors((current) => ({ ...current, [kind]: message }));

  const choose = async (kind: DocumentKind, event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = ""; // the same file can be chosen again
    if (!chosen) return;

    // Type first (as the backend), then shrink a big phone photo, then the size limit
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(chosen.type)) {
      setError(kind, t("errors.type"));
      return;
    }
    setPreparing(kind);
    const prepared = await shrinkImageForUpload(chosen);
    const problem = checkImageFile(prepared, t);
    if (problem) {
      setPreparing(null);
      setError(kind, problem);
      return;
    }
    const preview = await readAsDataUrl(prepared).catch(() => "");
    setPreparing(null);
    setError(kind);
    setPreviews((current) => ({ ...current, [kind]: preview }));
    onFilesChange((current) => ({ ...current, [kind]: prepared }));
    onRemovedChange((current) => current.filter((item) => item !== kind));
  };

  const discard = (kind: DocumentKind) => {
    onFilesChange((current) => {
      const next = { ...current };
      delete next[kind];
      return next;
    });
    setError(kind);
  };
  const markRemoved = (kind: DocumentKind) => onRemovedChange((current) => [...current, kind]);
  const restore = (kind: DocumentKind) => onRemovedChange((current) => current.filter((item) => item !== kind));

  const slots = DOCUMENT_KINDS.map((kind) => {
    const saved = existing?.[kind];
    const file = files[kind];
    return {
      kind,
      label: t(`kinds.member.${kind}`),
      saved,
      file,
      preview: file ? previews[kind] : undefined,
      isRemoved: !!saved && removed.includes(kind),
      isPreparing: preparing === kind,
      error: errors[kind],
    };
  });

  return (
    <FormSection title={tForm("title")} hint={tForm("hint")}>
      <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-4">
        {slots.map(({ kind, label, saved, file, preview, isRemoved, isPreparing, error }) => (
          <figure
            key={kind}
            className={cn(
              "flex min-w-0 flex-col gap-2 rounded-xl border bg-app-surface p-2",
              file ? "border-app-primary/50" : isRemoved ? "border-red-200" : "border-app-border",
            )}
          >
            <figcaption className="flex items-center justify-between gap-1 px-0.5 text-xs font-semibold text-app-text">
              <span className="truncate">{label}</span>
              {file && (
                <span className="shrink-0 rounded-full bg-app-primary/10 px-1.5 text-[10px] font-semibold text-app-primary">
                  {tForm("new")}
                </span>
              )}
            </figcaption>

            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-app-surface-muted">
              {file && preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={label} className="h-full w-full object-contain" />
              )}
              {!file && saved && owner && (
                <span className={cn("block h-full w-full", isRemoved && "opacity-30 grayscale")}>
                  <DocumentImage owner={owner} kind={kind} file={saved} size="thumb" alt={label} />
                </span>
              )}
              {!file && !saved && (
                <span className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-app-text-muted">
                  {t("empty")}
                </span>
              )}
              {isRemoved && !file && (
                <span className="absolute inset-x-0 bottom-0 bg-red-600/90 px-1 py-0.5 text-center text-[11px] font-semibold text-white">
                  {tForm("willRemove")}
                </span>
              )}
              {isPreparing && (
                <span className="absolute inset-0 flex items-center justify-center bg-app-surface/80 text-xs font-semibold text-app-text">
                  {tForm("preparing")}
                </span>
              )}
            </div>

            {file && saved && <p className="px-0.5 text-[11px] text-app-text-muted">{tForm("replacesSaved")}</p>}
            {error && (
              <p role="alert" className="px-0.5 text-xs text-red-700">
                {error}
              </p>
            )}

            <input
              ref={(element) => {
                inputs.current[kind] = element;
              }}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => void choose(kind, event)}
            />
            <div className="flex gap-1.5">
              {isRemoved && !file ? (
                <button type="button" onClick={() => restore(kind)} disabled={disabled} className={ACTION}>
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                  {tForm("undo")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => inputs.current[kind]?.click()}
                  disabled={disabled || isPreparing}
                  aria-label={saved || file ? t("replaceFor", { name: label }) : t("uploadFor", { name: label })}
                  className={ACTION}
                >
                  {saved || file ? (
                    <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : (
                    <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                  {saved || file ? t("replace") : tForm("choose")}
                </button>
              )}
              {file && (
                <button
                  type="button"
                  onClick={() => discard(kind)}
                  disabled={disabled}
                  aria-label={tForm("discardFor", { name: label })}
                  title={tForm("discard")}
                  className={cn(ACTION, "flex-none px-2.5")}
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
              {!file && saved && !isRemoved && (
                <button
                  type="button"
                  onClick={() => markRemoved(kind)}
                  disabled={disabled}
                  aria-label={t("removeFor", { name: label })}
                  title={t("remove")}
                  className={cn(ACTION, "flex-none px-2.5 hover:bg-red-50 hover:text-red-700")}
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </figure>
        ))}
      </div>
      <p className="text-xs text-app-text-muted sm:col-span-2">{t("rules")}</p>
    </FormSection>
  );
}
