"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ListUpdatingHintProps = { show: boolean; label: string };

// "Updating…" above a list while a new page/search loads or the list refetches
// (the old rows stay visible). Put it first inside a `relative` section: it sits
// in the gap above the list, so it takes no space and nothing jumps.
export function ListUpdatingHint({ show, label }: ListUpdatingHintProps) {
  return (
    <p aria-live="polite" className="absolute -top-5 right-1 text-xs text-app-text-muted">
      {show && (
        <span className="inline-flex items-center gap-1.5">
          <Spinner className="h-3 w-3" />
          {label}
        </span>
      )}
    </p>
  );
}

// First load: grey rows in the shape of the list.
export function ListLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-app-surface-muted" />
      ))}
    </div>
  );
}

type ListEmptyProps = { icon: LucideIcon; title: string; body?: string };

export function ListEmpty({ icon: Icon, title, body }: ListEmptyProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-app-border bg-app-surface px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-app-surface-muted text-app-text-muted">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-app-text">{title}</h2>
      {body && <p className="mt-1 max-w-sm text-sm text-app-text-muted">{body}</p>}
    </div>
  );
}

type ListErrorProps = { title: string; retryLabel: string; onRetry: () => void; isRetrying: boolean };

export function ListError({ title, retryLabel, onRetry, isRetrying }: ListErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <CircleAlert aria-hidden="true" className="h-6 w-6 text-red-600" />
      <p className="mt-3 text-sm font-medium text-red-700">{title}</p>
      <Button type="button" variant="outline" onClick={onRetry} isLoading={isRetrying} className="mt-4">
        {retryLabel}
      </Button>
    </div>
  );
}

type QueryLike<T> = {
  data: T | undefined;
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
};

type QueryStateProps<T> = {
  query: QueryLike<T>;
  errorTitle: string;
  retryLabel: string;
  /** First-load placeholder; defaults to grey rows. */
  loading?: ReactNode;
  children: (data: T) => ReactNode;
};

// One read's three states for a section: grey rows on first load, the error
// card only while there is nothing to show, otherwise the content. A failed
// background refetch keeps the last good data on screen.
export function QueryState<T>({ query, errorTitle, retryLabel, loading, children }: QueryStateProps<T>) {
  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.isError) {
    return (
      <ListError title={errorTitle} retryLabel={retryLabel} onRetry={() => void query.refetch()} isRetrying={query.isFetching} />
    );
  }
  return <>{loading ?? <ListLoading rows={3} />}</>;
}
