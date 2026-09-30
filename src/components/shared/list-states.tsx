"use client";

import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

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
