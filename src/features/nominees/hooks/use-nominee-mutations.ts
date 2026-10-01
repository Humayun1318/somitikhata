"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { nomineeApi } from "../api";
import { nomineeKeys } from "../query-keys";
import type { CreateNomineePayload, Nominee, UpdateNomineePayload } from "../types";

// Every change refetches that member's nominee list.
function useRefreshMemberNominees(memberNo: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: nomineeKeys.byMember(memberNo) });
}

export function useCreateNominee(memberNo: string) {
  const refresh = useRefreshMemberNominees(memberNo);

  return useMutation<Nominee, ApiError, CreateNomineePayload>({
    meta: { loadingMessage: "createNominee" },
    mutationFn: (payload) => nomineeApi.create(memberNo, payload),
    onSuccess: refresh,
  });
}

export function useUpdateNominee(memberNo: string) {
  const refresh = useRefreshMemberNominees(memberNo);

  return useMutation<Nominee, ApiError, { id: string; payload: UpdateNomineePayload }>({
    meta: { loadingMessage: "updateNominee" },
    mutationFn: ({ id, payload }) => nomineeApi.update(id, payload),
    onSuccess: refresh,
  });
}

export function useDeleteNominee(memberNo: string) {
  const refresh = useRefreshMemberNominees(memberNo);

  return useMutation<void, ApiError, string>({
    meta: { loadingMessage: "deleteNominee" },
    mutationFn: nomineeApi.remove,
    onSuccess: refresh,
  });
}
