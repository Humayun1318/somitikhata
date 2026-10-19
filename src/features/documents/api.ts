import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { DocumentKind, DocumentOwner, ImageSize, StoredFileInfo } from "./types";

// /documents/member/:memberNo/:kind or /documents/nominee/:id/:kind
const path = (owner: DocumentOwner, kind: DocumentKind) =>
  owner.type === "member"
    ? `/documents/member/${encodeURIComponent(owner.memberNo)}/${kind}`
    : `/documents/nominee/${encodeURIComponent(owner.nomineeId)}/${kind}`;

// Reads a Blob as a data: URL. A data URL needs no cleanup (unlike
// URL.createObjectURL), so TanStack Query can cache and drop it freely.
const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// Plain async functions. No React, no cache logic.
export const documentApi = {
  // POST multipart, field "file" -> data: the stored file info.
  // No Content-Type here: the browser sets multipart with its boundary.
  upload: async (owner: DocumentOwner, kind: DocumentKind, file: File) => {
    const body = new FormData();
    body.append("file", file);
    const { data } = await httpKit.post<ApiEnvelope<StoredFileInfo & { kind: DocumentKind }>>(path(owner, kind), body);
    return data.data;
  },

  // GET -> the image bytes (sent with the auth cookie like every API call;
  // the backend checks who may see it). Returned as a data URL for <img src>.
  image: async (owner: DocumentOwner, kind: DocumentKind, size: ImageSize): Promise<string> => {
    const { data } = await httpKit.get<Blob>(path(owner, kind), { params: { size }, responseType: "blob" });
    return toDataUrl(data);
  },

  // DELETE (office only) -> data: null
  remove: async (owner: DocumentOwner, kind: DocumentKind): Promise<void> => {
    await httpKit.delete<ApiEnvelope<null>>(path(owner, kind));
  },
};
