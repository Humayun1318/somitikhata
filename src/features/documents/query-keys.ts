import type { DocumentKind, DocumentOwner, ImageSize } from "./types";

const ownerId = (owner: DocumentOwner) => (owner.type === "member" ? owner.memberNo : owner.nomineeId);

// The version is in the key: a replaced image has a new version, so the
// new key fetches it, and an unchanged image is never fetched twice.
export const documentKeys = {
  all: ["documents"] as const,
  image: (owner: DocumentOwner, kind: DocumentKind, size: ImageSize, version: number) =>
    [...documentKeys.all, owner.type, ownerId(owner), kind, size, version] as const,
};
