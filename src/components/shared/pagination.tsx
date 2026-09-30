"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

import type { PaginationMeta } from "@/types/api";

// Backend QueryBuilder maxLimit is 100.
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type PaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

// Shared by every list page. Everything comes from the backend meta.
export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  const t = useTranslations("Pagination");

  const from = meta.total === 0 ? 0 : meta.skip + 1;
  const to = Math.min(meta.skip + meta.limit, meta.total);
  const totalPages = Math.max(meta.totalPages, 1);

  const goPrevious = () => meta.previousPage && onPageChange(meta.previousPage);
  const goNext = () => meta.nextPage && onPageChange(meta.nextPage);

  return (
    <nav
      aria-label={t("page", { page: meta.page, totalPages })}
      className="flex flex-col gap-3 text-sm text-app-text-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center justify-between gap-4 sm:justify-start">
        <p>{t("showing", { from, to, total: meta.total })}</p>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap">{t("perPage")}</span>
          <Select
            value={meta.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="min-h-9 w-20 py-1.5"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={goPrevious}
          disabled={!meta.hasPreviousPage}
          className="min-h-10 gap-1 px-3"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          {t("previous")}
        </Button>
        <span className="px-2 whitespace-nowrap text-app-text">{t("page", { page: meta.page, totalPages })}</span>
        <Button
          type="button"
          variant="outline"
          onClick={goNext}
          disabled={!meta.hasNextPage}
          className="min-h-10 gap-1 px-3"
        >
          {t("next")}
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
