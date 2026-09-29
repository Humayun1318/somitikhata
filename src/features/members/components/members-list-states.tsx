"use client";

import { CircleAlert, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

// First load: grey rows in the shape of the list.
export function MembersLoading() {
  return (
    <div aria-busy="true" className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-app-surface-muted" />
      ))}
    </div>
  );
}

export function MembersEmpty({ isFiltered }: { isFiltered: boolean }) {
  const t = useTranslations("Members.empty");
  const title = isFiltered ? t("filteredTitle") : t("title");
  const body = isFiltered ? t("filteredBody") : t("body");

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-app-border bg-app-surface px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-app-surface-muted text-app-text-muted">
        <Users aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-app-text">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-app-text-muted">{body}</p>
    </div>
  );
}

export function MembersError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  const t = useTranslations("Members.error");

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <CircleAlert aria-hidden="true" className="h-6 w-6 text-red-600" />
      <p className="mt-3 text-sm font-medium text-red-700">{t("title")}</p>
      <Button type="button" variant="outline" onClick={onRetry} isLoading={isRetrying} className="mt-4">
        {t("retry")}
      </Button>
    </div>
  );
}
