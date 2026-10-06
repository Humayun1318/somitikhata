import type { QueryClient } from "@tanstack/react-query";

import { authKeys } from "./query-keys";

/**
 * Forget everything about the signed-in user, in an order that causes no
 * error flashes:
 * 1. stop running requests, so none of them lands (or fails with 401) later;
 * 2. drop every cached query except the user;
 * 3. set the user to `null` ("signed out"): AuthGate then unmounts the
 *    protected pages at once (they never refetch the queries removed in 2)
 *    and sends the user to sign in. The login page reads `null` and shows the
 *    form without asking /user/me again.
 */
export function endSession(queryClient: QueryClient) {
  void queryClient.cancelQueries();
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me[0] });
  queryClient.setQueryData(authKeys.me, null);
}
