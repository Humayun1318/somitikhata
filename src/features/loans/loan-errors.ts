import { getCollectionError, type CollectionError } from "@/features/collections/collection-errors";
import { formatPaisa } from "@/lib/money";

type Translate = (key: string, values?: Record<string, string>) => string;

// Known loan.service.ts messages -> our own text. Anything else (closed
// books, closed account, network ...) goes through the collections mapper.
const KNOWN: { pattern: RegExp; key: string; money?: boolean; value?: string }[] = [
  { pattern: /already has an open loan \(([^)]+)\)/i, key: "openLoan", value: "loanNo" },
  { pattern: /exceeds this member's eligible loan limit \(৳([\d.,]+)\)/i, key: "overEligible", money: true, value: "amount" },
  { pattern: /eligible amount has dropped to ৳([\d.,]+)/i, key: "eligibleDropped", money: true, value: "amount" },
  { pattern: /Cannot (?:approve|reject|disburse|repay) a loan with status/i, key: "wrongStatus" },
  { pattern: /Cannot process a loan for a \w+ member/i, key: "memberNotActive" },
  { pattern: /No pending installment/i, key: "noPending" },
  { pattern: /^Loan not found/i, key: "notFound" },
];

/** `t` is useTranslations("LoanErrors"), `tCollections` useTranslations("CollectionErrors"). */
export function getLoanError(
  error: unknown,
  t: Translate,
  tCollections: Translate,
  locale: string,
  fields: string[] = [],
): CollectionError {
  const message = error instanceof Error ? error.message : "";
  for (const { pattern, key, money, value } of KNOWN) {
    const match = message.match(pattern);
    if (!match) continue;
    const raw = match[1] ?? "";
    const text = money ? formatPaisa(Math.round(Number(raw.replace(/,/g, "")) * 100), locale) : raw;
    return { fieldErrors: [], formError: t(key, value ? { [value]: text } : undefined) };
  }
  return getCollectionError(error, tCollections, locale, fields);
}
