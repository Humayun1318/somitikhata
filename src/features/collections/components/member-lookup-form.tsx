"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MemberLookupFormProps = {
  /** The member number in the URL. Pass it as `key` too, so the field follows back/forward. */
  memberNo: string;
  onLookup: (memberNo: string) => void;
  isLooking: boolean;
};

export function MemberLookupForm({ memberNo, onLookup, isLooking }: MemberLookupFormProps) {
  const t = useTranslations("Passbook");
  const [draft, setDraft] = useState(memberNo);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (text) onLookup(text);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-2xl border border-app-border bg-app-surface p-4 sm:flex-row sm:items-end"
    >
      <label className="flex-1 text-sm font-medium text-app-text">
        {t("lookupLabel")}
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          enterKeyHint="search"
          placeholder={t("lookupPlaceholder")}
          className="mt-1.5 min-h-11 font-mono"
        />
      </label>
      <Button type="submit" isLoading={isLooking} className="gap-2 sm:w-auto">
        {!isLooking && <Search aria-hidden="true" className="h-4 w-4" />}
        {t("lookupSubmit")}
      </Button>
    </form>
  );
}
