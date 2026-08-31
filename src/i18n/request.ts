
import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
    let activeLocale = locale;

    if (!activeLocale) {
        const paramLocale = await rootParams.locale();

        if (hasLocale(routing.locales, paramLocale)) {
            activeLocale = paramLocale;
        } else {
            notFound();
        }
    }

    return {
        locale: activeLocale,
        messages: (await import(`../../messages/${activeLocale}.json`)).default,
    };
});
