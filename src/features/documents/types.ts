// Shapes from the backend document module (bottolisomobai-server, document.interface.ts).

// The four image slots a member and a nominee each have.
export const DOCUMENT_KINDS = ["photo", "idFront", "idBack", "signature"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** What the API tells about one uploaded image (never a Cloudinary URL). */
export type StoredFileInfo = {
  /** Changes on every upload: part of the cache key, so a new image is fetched. */
  version: number;
  format: string;
  bytes: number;
  width: number;
  height: number;
  uploadedAt: string;
};

/** Member.documents / Nominee.documents: only the filled slots are present. */
export type Documents = Partial<Record<DocumentKind, StoredFileInfo>>;

/** Whose images: a member (by member number) or a nominee (by _id). */
export type DocumentOwner = { type: "member"; memberNo: string } | { type: "nominee"; nomineeId: string };

/** "thumb" = 320 px copy for cards, "full" = the stored image for the viewer. */
export type ImageSize = "thumb" | "full";

// Same limits as the backend (document.constants.ts): checked here first so
// a wrong file gets an answer at once, without uploading it.
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Longest side Cloudinary keeps (backend STORED_MAX_SIDE): a bigger photo is shrunk to it before sending. */
export const STORED_MAX_SIDE = 1600;

/** Slots a member may fill themselves (backend: MEMBER_SELF_UPLOAD_KINDS). */
export const MEMBER_SELF_UPLOAD_KINDS: readonly DocumentKind[] = ["photo"];
