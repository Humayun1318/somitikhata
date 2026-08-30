export type Locale = 'en' | 'bn';

export const locales: Locale[] = ['en', 'bn'];

export function getLocaleFromPathname(pathname: string | null): Locale {
  const match = pathname?.match(/^\/(en|bn)(?=\/|$)/);
  return match?.[1] === 'bn' ? 'bn' : 'en';
}

export function switchLocalePath(pathname: string | null, targetLocale: Locale): string {
  const currentPath = pathname ?? '/';
  const match = currentPath.match(/^\/(en|bn)(?=\/|$)/);
  const basePath = match ? currentPath.slice(match[0].length) || '' : currentPath;

  return `/${targetLocale}${basePath}`;
}
