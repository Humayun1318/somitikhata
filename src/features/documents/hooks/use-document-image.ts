"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { documentApi } from "../api";
import { documentKeys } from "../query-keys";
import type { DocumentKind, DocumentOwner, ImageSize, StoredFileInfo } from "../types";

// One image as a data URL. Runs only when the slot has a file. A version's
// bytes never change, so the result stays fresh (staleTime Infinity) and is
// dropped from memory 5 minutes after nothing shows it.
export function useDocumentImage(
  owner: DocumentOwner,
  kind: DocumentKind,
  file: StoredFileInfo | undefined,
  size: ImageSize,
  enabled = true,
) {
  return useQuery<string, ApiError>({
    queryKey: documentKeys.image(owner, kind, size, file?.version ?? 0),
    queryFn: () => documentApi.image(owner, kind, size),
    enabled: enabled && !!file,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });
}
