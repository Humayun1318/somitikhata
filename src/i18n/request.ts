import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { loadMessages } from './messages';

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: await loadMessages(activeLocale),
  };
});
