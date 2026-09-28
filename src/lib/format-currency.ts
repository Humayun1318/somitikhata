export type Locale = 'en' | 'bn';

export function formatCurrency(value: number, locale: Locale = 'en') {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
