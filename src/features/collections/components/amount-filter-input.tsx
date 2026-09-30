"use client";

import { useState, type KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import { TAKA_INPUT_PATTERN } from "@/lib/money";

type AmountFilterInputProps = {
  label: string;
  /** Taka, as in the URL ("" = not set). Pass it as `key` too, so outside changes reset the draft. */
  value: string;
  onCommit: (value: string) => void;
};

// Typing doesn't search on every key: the amount is applied on blur or Enter,
// and only when it is a valid taka amount.
export function AmountFilterInput({ label, value, onCommit }: AmountFilterInputProps) {
  const [draft, setDraft] = useState(value);
  const text = draft.trim();
  const isValid = text === "" || TAKA_INPUT_PATTERN.test(text);

  const commit = () => {
    if (isValid && text !== value) onCommit(text);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit();
  };

  return (
    <label className="text-sm font-medium text-app-text">
      {label}
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        error={!isValid}
        aria-invalid={!isValid}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder="0.00"
        className="mt-1.5 min-h-11 tabular-nums"
      />
    </label>
  );
}
