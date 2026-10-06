import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

const MAX_RETRIES = 2;

// Only failures that can pass by themselves are worth another try: no
// connection (status 0), a timeout, rate limiting, or a server/deploy error.
// A 4xx answer (bad input, 401, 403, 404, 409) will not change on retry.
function isTemporaryFailure(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
}

// One place for the defaults. Used by
// TanstackQueryProvider (one client per browser session, a new one per server render).
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Without retries one network blip (or a 5xx during a deploy) turned a
        // page red until the user pressed Retry. Two retries with the default
        // backoff (1s, 2s) hide those blips; real errors still show quickly.
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isTemporaryFailure(error),
        // Off on purpose: admins switch tabs a lot, and every return would dim
        // the lists ("updating…"). Data is refreshed on mount once stale and
        // right after every change made here (mutations invalidate their keys).
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Another admin may change members, loans or settings at any time, so a
        // page opened again after a minute asks the server again.
        staleTime: 60 * 1000,
        gcTime: 1000 * 60 * 30, // cache gets cleaned after 30 minutes
      },
      mutations: {
        // Writes are not safe to repeat on their own (a payment could be saved twice).
        retry: false,
      },
    },
  });
}
