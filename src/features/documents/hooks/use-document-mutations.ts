"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { membershipKeys } from "@/features/membership/hooks/use-my-membership";
import { memberKeys } from "@/features/members/query-keys";
import { nomineeKeys } from "@/features/nominees/query-keys";
import { ApiError } from "@/lib/api-errors";

import { documentApi } from "../api";
import type { DocumentKind, DocumentOwner } from "../types";

// The image info lives on the member / nominee record, so after a change
// those lists refetch; the new version then loads the new image.
function useRefreshOwner(owner: DocumentOwner) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      owner.type === "member"
        ? [
            queryClient.invalidateQueries({ queryKey: memberKeys.all }),
            queryClient.invalidateQueries({ queryKey: membershipKeys.me }),
          ]
        : [queryClient.invalidateQueries({ queryKey: nomineeKeys.all })],
    );
}

export function useUploadDocument(owner: DocumentOwner) {
  const refresh = useRefreshOwner(owner);

  return useMutation<unknown, ApiError, { kind: DocumentKind; file: File }>({
    meta: { loadingMessage: "uploadDocument" },
    mutationFn: ({ kind, file }) => documentApi.upload(owner, kind, file),
    onSuccess: refresh,
  });
}

export function useRemoveDocument(owner: DocumentOwner) {
  const refresh = useRefreshOwner(owner);

  return useMutation<void, ApiError, DocumentKind>({
    meta: { loadingMessage: "deleteDocument" },
    mutationFn: (kind) => documentApi.remove(owner, kind),
    onSuccess: refresh,
  });
}
