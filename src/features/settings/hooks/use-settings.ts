"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { settingApi } from "../api";
import { settingKeys } from "../query-keys";
import type { SettingSummary, UpdateSettingPayload } from "../types";

export function useSettings() {
  return useQuery<SettingSummary[], ApiError>({
    queryKey: settingKeys.list(),
    queryFn: settingApi.list,
  });
}

// One key's current value (e.g. the withdrawal limit for a form hint). "" = off.
export function useSetting(key: string) {
  return useQuery<SettingSummary, ApiError>({
    queryKey: settingKeys.one(key),
    queryFn: () => settingApi.get(key),
    enabled: !!key,
  });
}

type UpdateVariables = { key: string } & UpdateSettingPayload;

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, UpdateVariables>({
    meta: { loadingMessage: "updateSetting" },
    mutationFn: ({ key, ...payload }) => settingApi.update(key, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingKeys.all }),
  });
}
