"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { ListEmpty, ListError, ListLoading } from "@/components/shared/list-states";

export const MembersLoading = () => <ListLoading />;

export function MembersEmpty({ isFiltered }: { isFiltered: boolean }) {
  const t = useTranslations("Members.empty");
  const title = isFiltered ? t("filteredTitle") : t("title");
  const body = isFiltered ? t("filteredBody") : t("body");

  return <ListEmpty icon={Users} title={title} body={body} />;
}

export function MembersError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  const t = useTranslations("Members.error");

  return <ListError title={t("title")} retryLabel={t("retry")} onRetry={onRetry} isRetrying={isRetrying} />;
}
