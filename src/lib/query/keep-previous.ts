import { hashKey, type QueryKey } from "@tanstack/react-query";

/**
 * `placeholderData` for a list that belongs to one thing (a member's passbook,
 * an account's cash book). While the next page/filter of the SAME thing loads,
 * the old rows stay on screen. When the thing itself changes, nothing is kept:
 * member B's passbook must never show member A's rows under B's name.
 *
 * `scopeIndex` is the position of that thing in the query key.
 */
export function keepPreviousInScope(queryKey: QueryKey, scopeIndex: number) {
  const scope = hashKey([queryKey[scopeIndex]]);
  return <TData>(previousData: TData | undefined, previousQuery: { queryKey: QueryKey } | undefined) =>
    previousQuery && hashKey([previousQuery.queryKey[scopeIndex]]) === scope ? previousData : undefined;
}
