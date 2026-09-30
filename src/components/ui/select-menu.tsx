"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import { inputErrorClass } from "./input";

export type SelectOption = {
  value: string;
  label: string;
  /** Options with the same group are listed under one heading, in first-seen order. */
  group?: string;
  disabled?: boolean;
  /** Tailwind bg class for a small colored dot (e.g. a status color). */
  dot?: string;
};

type SelectMenuProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when no option matches `value`. */
  placeholder?: string;
  /** Needed when there is no visible <label htmlFor={id}>. */
  "aria-label"?: string;
  "aria-describedby"?: string;
  /** Default: a search box when there are more than 8 options. */
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
  /** Filter style: a primary border when something other than the default is chosen. */
  highlighted?: boolean;
  size?: "md" | "sm";
  className?: string;
  onBlur?: () => void;
};

type Row = { kind: "group"; label: string } | { kind: "option"; option: SelectOption; index: number };

const PANEL_MAX_HEIGHT = 320;
const MOBILE_QUERY = "(max-width: 639px)";
const normalize = (text: string) => text.toLocaleLowerCase().trim();

/**
 * The app's dropdown (filters and form fields). The panel is a native popover,
 * so it sits in the top layer: never clipped by a scroll area or a dialog, and
 * it never pushes the page layout. Desktop: under the trigger (or above it when
 * there's no room). Phones: a bottom sheet. Long lists scroll inside and get a
 * search box. Keyboard: ↑ ↓ Home End Enter Esc, like a native select.
 */
export function SelectMenu({
  id,
  value,
  onChange,
  options,
  placeholder = "",
  searchable,
  disabled,
  error,
  highlighted,
  size = "md",
  className,
  onBlur,
  ...aria
}: SelectMenuProps) {
  const t = useTranslations("SelectMenu");
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const panelId = `${autoId}-panel`;
  const listId = `${autoId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasSearch = searchable ?? options.length > 8;
  const visible = query ? options.filter((option) => normalize(option.label).includes(normalize(query))) : options;
  const selected = options.find((option) => option.value === value);
  const optionId = (index: number) => `${listId}-${index}`;

  // Flat rows with group headings, so the list renders in one pass.
  const rows: Row[] = [];
  let lastGroup: string | undefined;
  visible.forEach((option, index) => {
    if (option.group && option.group !== lastGroup) rows.push({ kind: "group", label: option.group });
    lastGroup = option.group;
    rows.push({ kind: "option", option, index });
  });

  const enabledIndexes = visible.flatMap((option, index) => (option.disabled ? [] : [index]));
  const firstEnabled = enabledIndexes[0] ?? -1;
  const lastEnabled = enabledIndexes.at(-1) ?? -1;

  // Desktop: place the panel under the trigger, or above it when there's no room.
  const placePanel = () => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    if (window.matchMedia(MOBILE_QUERY).matches) {
      panel.removeAttribute("style");
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const margin = 8;
    const width = Math.max(rect.width, 224);
    const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
    const spaceAbove = rect.top - gap - margin;
    const openUp = spaceBelow < Math.min(PANEL_MAX_HEIGHT, 200) && spaceAbove > spaceBelow;
    const left = Math.min(Math.max(rect.left, margin), window.innerWidth - width - margin);

    panel.style.left = `${left}px`;
    panel.style.minWidth = `${width}px`;
    panel.style.maxWidth = `${Math.max(width, Math.min(352, window.innerWidth - margin * 2))}px`;
    panel.style.maxHeight = `${Math.min(PANEL_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow)}px`;
    panel.style.top = openUp ? "auto" : `${rect.bottom + gap}px`;
    panel.style.bottom = openUp ? `${window.innerHeight - rect.top + gap}px` : "auto";
  };

  // Keep React state in sync with the popover (it can also close on its own:
  // outside click, Esc, another popover opening).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const handleBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") placePanel();
    };
    const handleToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === "open";
      setIsOpen(opened);
      if (opened) {
        // Start on the chosen option, then move focus into the panel.
        const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled);
        // Touch screens: focus the list, not the search box, so the keyboard doesn't pop up.
        const usesMouse = window.matchMedia("(pointer: fine)").matches;
        requestAnimationFrame(() =>
          ((usesMouse && searchRef.current) || listRef.current)?.focus({ preventScroll: true }),
        );
      } else {
        setQuery("");
        // The field counts as "touched" when the menu closes, not when focus moves into it.
        onBlur?.();
        if (panel.contains(document.activeElement) || document.activeElement === document.body) {
          triggerRef.current?.focus();
        }
      }
    };
    panel.addEventListener("beforetoggle", handleBeforeToggle);
    panel.addEventListener("toggle", handleToggle);
    return () => {
      panel.removeEventListener("beforetoggle", handleBeforeToggle);
      panel.removeEventListener("toggle", handleToggle);
    };
  });

  // While open: follow the trigger on scroll, close when the window resizes.
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => placePanel();
    const close = () => panelRef.current?.hidePopover();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", close);
    };
  });

  // Keep the active option in view.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  });

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    panelRef.current?.hidePopover();
    triggerRef.current?.focus();
  };

  const move = (step: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const position = enabledIndexes.indexOf(activeIndex);
    const next = position === -1 ? (step === 1 ? 0 : enabledIndexes.length - 1) : position + step;
    setActiveIndex(enabledIndexes[Math.min(Math.max(next, 0), enabledIndexes.length - 1)]);
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => setActiveIndex(firstEnabled),
      End: () => setActiveIndex(lastEnabled),
      Enter: () => visible[activeIndex] && choose(visible[activeIndex]),
      Tab: () => panelRef.current?.hidePopover(),
    };
    const action = keys[event.key];
    if (!action) return;
    if (event.key !== "Tab") event.preventDefault();
    action();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    panelRef.current?.showPopover();
  };

  // Focus moving into the open panel is not a blur of the field.
  const handleTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (!panelRef.current?.contains(event.relatedTarget as Node | null)) onBlur?.();
  };

  // Typing filters the list and moves the highlight to the first match.
  const handleSearch = (text: string) => {
    setQuery(text);
    const matches = options.filter((option) => normalize(option.label).includes(normalize(text)));
    setActiveIndex(matches.findIndex((option) => !option.disabled));
  };

  const activeId = activeIndex >= 0 && visible[activeIndex] ? optionId(activeIndex) : undefined;
  const triggerLabel = selected?.label ?? placeholder;

  return (
    <div className={cn("relative min-w-0", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        popoverTarget={panelId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={aria["aria-label"]}
        aria-describedby={aria["aria-describedby"]}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-app-border bg-app-surface text-left text-sm text-app-text transition-colors",
          "hover:border-app-text-muted/40 focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-focus",
          "disabled:cursor-not-allowed disabled:bg-app-surface-muted disabled:opacity-50",
          size === "sm" ? "min-h-9 px-3 py-1.5" : "min-h-11 px-3.5 py-2.5",
          isOpen && "border-app-primary ring-2 ring-app-focus",
          highlighted && "border-app-primary bg-app-primary/5 font-medium text-app-primary",
          error && inputErrorClass,
        )}
      >
        {selected?.dot && <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", selected.dot)} />}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-app-text-muted/70")}>{triggerLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 shrink-0 text-app-text-muted transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        onKeyDown={handlePanelKeyDown}
        className={cn(
          "m-0 flex-col overflow-hidden rounded-xl border border-app-border bg-app-surface p-0 text-app-text shadow-xl shadow-slate-900/10",
          "open:flex",
          // Phones: bottom sheet with a dimmed backdrop. Desktop: positioned by placePanel().
          "fixed inset-x-3 bottom-3 top-auto max-h-[70dvh] w-auto sm:inset-auto",
          "max-sm:backdrop:bg-slate-950/40",
          "opacity-0 translate-y-2 sm:translate-y-0 sm:scale-[0.97]",
          "open:opacity-100 open:translate-y-0 sm:open:scale-100",
          "starting:open:opacity-0 starting:open:translate-y-2 sm:starting:open:translate-y-0 sm:starting:open:scale-[0.97]",
          "transition-[opacity,translate,scale,display,overlay] transition-discrete duration-150 ease-out motion-reduce:transition-none",
        )}
      >
        {hasSearch && (
          <div className="shrink-0 border-b border-app-border p-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted"
              />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                autoComplete="off"
                value={query}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={t("search")}
                className="w-full rounded-lg bg-app-surface-muted/70 py-2 pl-9 pr-3 text-sm text-app-text placeholder:text-app-text-muted/70 focus:outline-none focus:ring-2 focus:ring-app-focus"
              />
            </div>
          </div>
        )}

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={triggerId}
          aria-activedescendant={hasSearch ? undefined : activeId}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 focus:outline-none"
        >
          {rows.map((row) =>
            row.kind === "group" ? (
              <li
                key={`group-${row.label}`}
                role="presentation"
                className="px-2.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted first:pt-1"
              >
                {row.label}
              </li>
            ) : (
              <li
                key={row.option.value || "__empty"}
                id={optionId(row.index)}
                role="option"
                aria-selected={row.option.value === value}
                aria-disabled={row.option.disabled || undefined}
                onClick={() => choose(row.option)}
                onMouseMove={() => !row.option.disabled && setActiveIndex(row.index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  row.index === activeIndex && "bg-app-surface-muted",
                  row.option.value === value && "font-semibold text-app-primary",
                  row.option.disabled && "cursor-not-allowed opacity-45",
                )}
              >
                {row.option.dot && (
                  <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", row.option.dot)} />
                )}
                <span className="min-w-0 flex-1">{row.option.label}</span>
                {row.option.value === value && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
              </li>
            ),
          )}
          {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-app-text-muted">{t("noResults")}</li>}
        </ul>
      </div>
    </div>
  );
}
