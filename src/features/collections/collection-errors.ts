import { ApiError } from "@/lib/api-errors";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { formatPaisa } from "@/lib/money";

type Translate = (key: string, values?: Record<string, string>) => string;
type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

export type CollectionError = {
  /** Zod errors from the backend, by field name (amount, transactionDate, reason, ...). */
  fieldErrors: { field: string; message: string }[];
  formError: string | null;
};

// Known backend messages (transaction.service.ts) -> our own translated text.
// The regex groups become the message values, in order. Values named in
// MONEY_VALUES are taka amounts, re-formatted for the current language;
// DATE_VALUES are YYYY-MM-DD days. More specific patterns come first.
const MONEY_VALUES = ["allowed", "requested", "amount", "balance"];
const NUMBER_VALUES = ["percent"];
const DATE_VALUES = ["date"];

const KNOWN_MESSAGES: { pattern: RegExp; key: string; values?: string[] }[] = [
  // Closed books (backdate_lock_until)
  {
    pattern: /books are closed up to (\d{4}-\d{2}-\d{2})\. #(\S+) belongs to that closed year/i,
    key: "closedYearReversal",
    values: ["date", "transactionNo"],
  },
  { pattern: /books are closed up to (\d{4}-\d{2}-\d{2})/i, key: "booksClosed", values: ["date"] },
  // Refunds and the share lock
  { pattern: /Share is refunded in full only\. Share balance: ৳([\d.,]+)/i, key: "shareRefundFull", values: ["balance"] },
  {
    pattern: /Refund is more than the member's \w+ balance\. Balance: ৳([\d.,]+), requested: ৳([\d.,]+)/i,
    key: "refundOverBalance",
    values: ["balance", "requested"],
  },
  { pattern: /^(\S+) has no share to refund/i, key: "noShareToRefund", values: ["memberNo"] },
  { pattern: /already has a new Share Deposit/i, key: "shareRelock" },
  // Reversals
  {
    pattern: /Cannot reverse #(\S+): the member's \w+ balance is ৳([\d.,]+), less than this entry \(৳([\d.,]+)\)/i,
    key: "reversalNegative",
    values: ["transactionNo", "balance", "amount"],
  },
  { pattern: /Loan entries cannot be reversed here/i, key: "loanNotReversible" },
  { pattern: /linked entry #(\S+) is already reversed/i, key: "linkedReversed", values: ["transactionNo"] },
  // Samiti entries and ledger heads
  {
    pattern: /more than the ledger head's balance\. Balance: ৳([\d.,]+), requested: ৳([\d.,]+)/i,
    key: "headBalance",
    values: ["balance", "requested"],
  },
  { pattern: /cannot be used for a \w+ head/i, key: "wrongHeadKind" },
  { pattern: /^Ledger head is closed/i, key: "headClosed" },
  { pattern: /^Ledger head not found/i, key: "headNotFound" },
  { pattern: /From and to account must be different/i, key: "sameAccount" },
  { pattern: /Invalid or inactive type for a samiti/i, key: "invalidSocietyType" },
  { pattern: /^(\S+) already has a Share Deposit/i, key: "shareExists", values: ["memberNo"] },
  {
    pattern: /allowed limit \((\d+(?:\.\d+)?)% of current \w+ balance\)\. Allowed: ৳([\d.,]+), requested: ৳([\d.,]+)/i,
    key: "withdrawalLimit",
    values: ["percent", "allowed", "requested"],
  },
  { pattern: /needs at least ৳([\d.,]+) remaining/i, key: "loanBacking", values: ["amount"] },
  { pattern: /Cannot record a transaction for a \w+ member/i, key: "memberNotActive" },
  { pattern: /^Member not found/i, key: "memberNotFound" },
  { pattern: /^Invalid member number/i, key: "invalidMemberNo" },
  { pattern: /^Cash account .*is closed/i, key: "accountClosed" },
  { pattern: /^Cash account not found/i, key: "accountNotFound" },
  { pattern: /already reversed/i, key: "alreadyReversed" },
  { pattern: /reversal entry cannot itself be reversed/i, key: "reversalOfReversal" },
  { pattern: /does not support automatic reversal/i, key: "notReversible" },
  { pattern: /opening entry for this already exists \(([^)]+)\)/i, key: "openingExists", values: ["transactionNo"] },
  { pattern: /^Transaction not found/i, key: "notFound" },
];

/**
 * Turns a failed collections request into what a form should show.
 * `t` is useTranslations("CollectionErrors"). `fields` are the form's own field names:
 * backend field errors for other fields fall back to the form-level message.
 */
export function getCollectionError(
  error: unknown,
  t: Translate,
  locale: string,
  fields: string[] = [],
): CollectionError {
  const none: CollectionError = { fieldErrors: [], formError: null };

  if (!(error instanceof ApiError)) return { ...none, formError: t("generic") };
  if (error.status === 0) return { ...none, formError: t("network") };
  if (error.status === 403) return { ...none, formError: t("forbidden") };

  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  const fieldErrors = sources.flatMap(({ path, message }) =>
    path && message && fields.includes(path) ? [{ field: path, message }] : [],
  );
  if (fieldErrors.length > 0) return { ...none, fieldErrors };

  for (const { pattern, key, values = [] } of KNOWN_MESSAGES) {
    const match = error.message.match(pattern);
    if (match) {
      const params = Object.fromEntries(
        values.map((name, index) => [name, formatValue(name, match[index + 1] ?? "", locale)]),
      );
      return { ...none, formError: t(key, params) };
    }
  }

  const isUsefulMessage = error.status < 500 && !!error.message && error.message !== "Zod Error";
  return { ...none, formError: isUsefulMessage ? error.message : t("generic") };
}

function formatValue(name: string, raw: string, locale: string) {
  if (DATE_VALUES.includes(name)) return formatDay(raw, locale);
  const number = Number(raw.replace(/,/g, ""));
  if (Number.isNaN(number)) return raw;
  if (MONEY_VALUES.includes(name)) return formatPaisa(Math.round(number * 100), locale);
  if (NUMBER_VALUES.includes(name)) return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN").format(number);
  return raw;
}

// "2026-06-30" -> "30 Jun 2026" / "৩০ জুন, ২০২৬"
function formatDay(raw: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeZone: DHAKA_TIME_ZONE,
  }).format(new Date(`${raw}T00:00:00+06:00`));
}
