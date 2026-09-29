"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";

import type { MemberListParams } from "../types";

import { MemberSearch } from "./member-search";

// Mobile has no clickable table headers, so it gets a sort dropdown.
const SORT_OPTIONS = ["", "memberNo", "-memberNo", "nameBn", "-nameBn", "-joinDate", "joinDate", "status"];

type MembersToolbarProps = {
  params: MemberListParams;
  setParams: (changes: Partial<MemberListParams>) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function MembersToolbar({ params, setParams, hasFilters, onClearFilters }: MembersToolbarProps) {
  const t = useTranslations("Members");
  const hasDateFilter = !!(params.startJoinDate || params.endJoinDate);
  const [isFiltersOpen, setIsFiltersOpen] = useState(hasDateFilter);

  const toggleFilters = () => setIsFiltersOpen((open) => !open);
  const handleSearchChange = (search: string) => setParams({ search });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <MemberSearch search={params.search} onSearchChange={handleSearchChange} />
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={toggleFilters}
            aria-expanded={isFiltersOpen}
            aria-controls="member-filters"
            className={cn("flex-1 gap-2 px-4 sm:flex-none", hasDateFilter && "border-app-primary text-app-primary")}
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            {t("filters.toggle")}
          </Button>
          {hasFilters && (
            <Button type="button" variant="outline" onClick={onClearFilters} className="flex-1 gap-2 px-4 sm:flex-none">
              <X aria-hidden="true" className="h-4 w-4" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
      </div>

      {isFiltersOpen && (
        <div
          id="member-filters"
          className="grid gap-3 rounded-2xl border border-app-border bg-app-surface p-4 motion-safe:animate-fade-in-up sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="text-sm font-medium text-app-text">
            {t("filters.joinDateFrom")}
            <Input
              type="date"
              value={params.startJoinDate}
              max={params.endJoinDate || undefined}
              onChange={(event) => setParams({ startJoinDate: event.target.value })}
              className="mt-1.5 min-h-11"
            />
          </label>
          <label className="text-sm font-medium text-app-text">
            {t("filters.joinDateTo")}
            <Input
              type="date"
              value={params.endJoinDate}
              min={params.startJoinDate || undefined}
              onChange={(event) => setParams({ endJoinDate: event.target.value })}
              className="mt-1.5 min-h-11"
            />
          </label>
          <label className="text-sm font-medium text-app-text md:hidden">
            {t("sort.label")}
            <Select
              value={params.sort}
              onChange={(event) => setParams({ sort: event.target.value })}
              className="mt-1.5 min-h-11"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option || "default"} value={option}>
                  {t(`sort.${option || "default"}`)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      )}
    </div>
  );
}
