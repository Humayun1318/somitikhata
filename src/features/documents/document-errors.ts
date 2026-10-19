import { ApiError } from "@/lib/api-errors";

import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "./types";

type Translate = (key: string) => string;

/** The same checks as the backend, before uploading. Null = fine. */
export function checkImageFile(file: File, t: Translate): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return t("errors.type");
  if (file.size > MAX_UPLOAD_BYTES) return t("errors.size");
  return null;
}

/** A short message for a failed upload / remove (Documents namespace). */
export function getDocumentError(error: unknown, t: Translate, fallback: "errors.generic" | "errors.removeGeneric") {
  if (!(error instanceof ApiError)) return t(fallback);
  if (error.status === 0) return t("errors.network");
  if (error.status === 403) return t("errors.forbidden");
  if (error.status === 413) return t("errors.size");
  if (error.status === 415) return t("errors.type");
  if (error.status === 503) return t("errors.notConfigured");
  return t(fallback);
}
