"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

export type SegmentedOption = {
  value: string;
  label: string;
  /** Tailwind bg class for a small colored dot (e.g. a status color). */
  dot?: string;
};

type SegmentedControlProps = {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  "aria-label": string;
  disabled?: boolean;
  /** Stretch the segments over the full width (short, fixed choices like Cash / Bank). */
  fullWidth?: boolean;
  className?: string;
};

/**
 * A row of pill buttons for a handful of choices (status filters, Cash / Bank).
 * All options are visible at once, so it is quicker than a dropdown.
 * A radio group for assistive tech: ← → move and select, like native radios.
 * If the row is wider than the screen, it scrolls sideways inside itself.
 */
export function SegmentedControl({
  value,
  onChange,
  options,
  disabled,
  fullWidth,
  className,
  ...aria
}: SegmentedControlProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  const select = (index: number) => {
    const option = options[(index + options.length) % options.length];
    onChange(option.value);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons?.[(index + options.length) % options.length]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(event.key in steps)) return;
    event.preventDefault();
    select(selectedIndex + steps[event.key]);
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={aria["aria-label"]}
      onKeyDown={handleKeyDown}
      className={cn(
        "no-scrollbar max-w-full overflow-x-auto rounded-xl border border-app-border bg-app-surface-muted/70 p-1",
        // Phones: fade the right edge, so a row wider than the screen reads as scrollable.
        !fullWidth && "max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] max-sm:pr-6",
        fullWidth ? "flex" : "inline-flex",
        className,
      )}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={option.value || "__all"}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus disabled:cursor-not-allowed disabled:opacity-50",
              fullWidth && "flex-1",
              isSelected
                ? "bg-app-surface text-app-text shadow-sm ring-1 ring-app-border/70"
                : "text-app-text-muted hover:bg-app-surface/60 hover:text-app-text",
            )}
          >
            {option.dot && <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", option.dot)} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
