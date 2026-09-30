"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/cn";

type SortableHeaderProps = {
  label: string;
  sortLabel: string;
  /** A field the backend can sort by. */
  field: string;
  /** Current sort from the URL: "", "field" or "-field". */
  sort: string;
  onSortChange: (sort: string) => void;
};

// Click cycles: ascending -> descending -> back to the default order.
function nextSort(field: string, sort: string) {
  if (sort === field) return `-${field}`;
  if (sort === `-${field}`) return "";
  return field;
}

export function SortableHeader({ label, sortLabel, field, sort, onSortChange }: SortableHeaderProps) {
  const isAscending = sort === field;
  const isDescending = sort === `-${field}`;
  const isActive = isAscending || isDescending;
  const Icon = isAscending ? ArrowUp : isDescending ? ArrowDown : ArrowUpDown;
  const handleClick = () => onSortChange(nextSort(field, sort));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={sortLabel}
      className={cn(
        "-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-app-surface-muted hover:text-app-text",
        isActive && "text-app-text",
      )}
    >
      {label}
      <Icon aria-hidden="true" className={cn("h-3.5 w-3.5", !isActive && "opacity-40")} />
    </button>
  );
}

export function getAriaSort(field: string | undefined, sort: string) {
  if (!field) return undefined;
  if (sort === field) return "ascending" as const;
  if (sort === `-${field}`) return "descending" as const;
  return "none" as const;
}
