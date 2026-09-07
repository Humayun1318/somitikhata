import { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0];

  return segment === 'en' || segment === 'bn' ? segment : routing.defaultLocale;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'en' || segments[0] === 'bn') {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join('/')}`;
}
