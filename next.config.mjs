import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: true,
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(
  withSerwist({
    reactStrictMode: true,
    turbopack: {},
  })
);
