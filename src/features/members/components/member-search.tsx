"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

const SEARCH_DELAY_MS = 400;

type MemberSearchProps = {
  /** The search currently in the URL. */
  search: string;
  onSearchChange: (search: string) => void;
};

// Waits until the user stops typing, then searches. Enter searches at once.
export function MemberSearch({ search, onSearchChange }: MemberSearchProps) {
  const t = useTranslations("Members.search");
  const [draft, setDraft] = useState(search);
  const [lastSent, setLastSent] = useState(search);
  const [seenSearch, setSeenSearch] = useState(search);

  // The URL changed from outside (Clear filters, back button): show it.
  // Ignore our own searches coming back, so text typed meanwhile is kept.
  if (search !== seenSearch) {
    setSeenSearch(search);
    if (search !== lastSent) {
      setDraft(search);
      setLastSent(search);
    }
  }

  const send = (text: string) => {
    setLastSent(text);
    onSearchChange(text);
  };

  useEffect(() => {
    const text = draft.trim();
    if (text === search || text === lastSent) return;
    const timer = setTimeout(() => {
      setLastSent(text);
      onSearchChange(text);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, search, lastSent, onSearchChange]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft.trim());
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="relative flex-1">
      <label htmlFor="member-search" className="sr-only">
        {t("label")}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted"
      />
      <Input
        id="member-search"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t("placeholder")}
        className="min-h-11 pl-10"
      />
    </form>
  );
}
