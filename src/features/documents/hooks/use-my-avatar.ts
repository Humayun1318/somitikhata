"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { documentApi } from "../api";
import { documentKeys } from "../query-keys";
import type { ImageSize } from "../types";

// The logged-in user's avatar image as a data URL. `version` comes from
// GET /user/me (avatar.version); a new photo = a new version = a new fetch.
// No retries: on any problem the header just keeps showing the initials.
export function useMyAvatar(version: number | undefined, size: ImageSize = "thumb") {
  return useQuery<string, ApiError>({
    queryKey: documentKeys.myAvatar(size, version ?? 0),
    queryFn: () => documentApi.myAvatar(size),
    enabled: version !== undefined,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: false,
  });
}
