import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { loadMessages } from './messages';

// `locale` is set when a caller passes one (getTranslations({ locale })).
// Otherwise the locale comes from the request: the [locale] segment, as
// registered by setRequestLocale() for static pages. Without this fallback,
// server components that call useTranslations() rendered every locale in Bangla.
export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const activeLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: await loadMessages(activeLocale),
  };
});
