import { getCollectionError } from "@/features/collections/collection-errors";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

type Translate = (key: string, values?: Record<string, string>) => string;

// Known yearEnd.service.ts / report.service.ts messages -> our own text.
// Kinds in the messages are the backend's English labels.
const KIND_LABELS: Record<string, string> = {
  "service charge": "service_charge",
  dividend: "dividend",
  "profit appropriation": "appropriation",
};

const KNOWN: { pattern: RegExp; key: string; values?: ("fiscalYear" | "date" | "kind")[] }[] = [
  { pattern: /^(\d{4}-\d{2}) ends on (\d{4}-\d{2}-\d{2})/i, key: "notEnded", values: ["fiscalYear", "date"] },
  { pattern: /year-end of (\d{4}-\d{2}) is already final/i, key: "alreadyFinal", values: ["fiscalYear"] },
  { pattern: /Finish the year-end of (\d{4}-\d{2}) first \(next: ([^)]+)\)/i, key: "finishEarlier", values: ["fiscalYear", "kind"] },
  { pattern: /The (.+) for (\d{4}-\d{2}) has already been run/i, key: "alreadyRun", values: ["kind", "fiscalYear"] },
  { pattern: /Run the (.+) for (\d{4}-\d{2}) first/i, key: "runPreviousFirst", values: ["kind", "fiscalYear"] },
  { pattern: /(\d{4}-\d{2}) has a net loss/i, key: "netLoss", values: ["fiscalYear"] },
  { pattern: /No ledger head has the role/i, key: "missingFundHead" },
  { pattern: /must be an open fund head/i, key: "missingFundHead" },
  { pattern: /The dividend for (\d{4}-\d{2}) has not been run/i, key: "dividendNotRun", values: ["fiscalYear"] },
  { pattern: /The (.+) for (\d{4}-\d{2}) has not been run/i, key: "runNotFound", values: ["kind", "fiscalYear"] },
];

type Options = { t: Translate; tKind: Translate; tCollections: Translate; locale: string; fields?: string[] };

/**
 * A failed year-end or report request -> what to show. `t` is
 * useTranslations("YearEndErrors"), `tKind` useTranslations("YearEnd.kinds").
 * Everything else (closed books, network, a head's balance …) goes through the
 * collections mapper.
 */
export function getYearEndError(error: unknown, { t, tKind, tCollections, locale, fields = [] }: Options) {
  const message = error instanceof Error ? error.message : "";
  for (const { pattern, key, values = [] } of KNOWN) {
    const match = message.match(pattern);
    if (!match) continue;
    const params = Object.fromEntries(
      values.map((name, index) => {
        const raw = match[index + 1] ?? "";
        const kind = KIND_LABELS[raw.toLowerCase()];
        if (name === "kind" && kind) return [name, tKind(kind)];
        if (name === "date") return [name, formatDay(raw, locale)];
        return [name, raw];
      }),
    );
    return { fieldErrors: [], formError: t(key, params) };
  }
  return getCollectionError(error, tCollections, locale, fields);
}

const formatDay = (day: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }).format(
    new Date(`${day}T00:00:00+06:00`),
  );
