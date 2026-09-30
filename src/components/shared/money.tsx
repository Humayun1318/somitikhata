"use client";

import { useLocale } from "next-intl";

import { cn } from "@/lib/cn";
import { formatPaisa } from "@/lib/money";

type MoneyProps = {
  /** Amount in paisa, exactly as the backend sends it. */
  paisa: number;
  signed?: boolean;
  className?: string;
};

// Money shown the same way everywhere: tabular digits so columns line up.
export function Money({ paisa, signed, className }: MoneyProps) {
  const locale = useLocale();
  const text = formatPaisa(paisa, locale, { signed });

  return <span className={cn("whitespace-nowrap tabular-nums", className)}>{text}</span>;
}
