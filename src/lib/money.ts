// Money rules (see the development guide): the backend always sends and stores
// PAISA as whole numbers (1 taka = 100 paisa). Convert only for display/input.

const TAKA_SIGN = "৳";

// "৳1,23,456.50" / "৳১,২৩,৪৫৬.৫০". Lakh/crore grouping in both languages.
// signed: true shows "+" for positive amounts (e.g. a deposit in a passbook).
export function formatPaisa(
  paisa: number,
  locale: string,
  { signed = false }: { signed?: boolean } = {},
): string {
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(paisa) / 100);

  const sign = paisa < 0 ? "−" : signed && paisa > 0 ? "+" : "";
  return `${sign}${TAKA_SIGN}${number}`;
}

// Form input in taka ("1500.50") -> paisa (150050). Rounds away float noise.
export function takaToPaisa(taka: string | number): number {
  return Math.round(Number(taka) * 100);
}

// Taka with at most 2 decimals, e.g. "1500", "1500.5", "1500.50".
export const TAKA_INPUT_PATTERN = /^\d+(\.\d{1,2})?$/;
