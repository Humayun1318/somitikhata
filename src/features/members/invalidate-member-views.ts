import type { QueryClient } from "@tanstack/react-query";

import { collectionKeys } from "@/features/collections/query-keys";
import { loanKeys } from "@/features/loans/query-keys";
import { invalidateSummaries } from "@/features/overview/invalidate-summaries";

import { memberKeys } from "./query-keys";

/**
 * Everything that shows a member's name or status, after an edit or a status
 * change: member lists, the passbook / record-form lookup (GET /member/:no),
 * passbook rows and loans (both carry the member's name) and loan eligibility
 * (only an active member may borrow). Nominees and balances don't change.
 * Only queries on screen refetch now; the rest are marked stale.
 */
export function invalidateMemberViews(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: memberKeys.all }),
    queryClient.invalidateQueries({ queryKey: collectionKeys.members() }),
    queryClient.invalidateQueries({ queryKey: collectionKeys.ledgers() }),
    queryClient.invalidateQueries({ queryKey: loanKeys.all }),
    // Dashboards count members by status; dividends depend on the status too.
    invalidateSummaries(queryClient),
  ]);
}
