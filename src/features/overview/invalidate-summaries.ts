import type { QueryClient } from "@tanstack/react-query";

import { reportKeys } from "@/features/reports/query-keys";
import { yearEndKeys } from "@/features/year-end/query-keys";

import { overviewKeys } from "./query-keys";

/**
 * The views that add up the books: dashboards, reports and the year-end
 * status. Call it after any change to money, members, loans, heads or
 * settings, so none of them shows yesterday's totals. Only what is on screen
 * refetches now; the rest is just marked stale.
 */
export function invalidateSummaries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: overviewKeys.all }),
    queryClient.invalidateQueries({ queryKey: reportKeys.all }),
    queryClient.invalidateQueries({ queryKey: yearEndKeys.all }),
  ]);
}
