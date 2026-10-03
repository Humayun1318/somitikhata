import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { SettingSummary, UpdateSettingPayload } from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const settingApi = {
  list: async () => data(await httpKit.get<ApiEnvelope<SettingSummary[]>>("/settings")),

  get: async (key: string) => data(await httpKit.get<ApiEnvelope<SettingSummary>>(`/settings/${key}`)),

  // A change is a new version from effectiveFrom on; older versions stay.
  update: async (key: string, payload: UpdateSettingPayload) =>
    data(await httpKit.patch<ApiEnvelope<unknown>>(`/settings/${key}`, payload)),
};
