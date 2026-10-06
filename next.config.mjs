import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: true,
});

const withNextIntl = createNextIntlPlugin();

// Basic browser protections for every page. A Content-Security-Policy is not
// set here: it has to list the API origin of each deployment, so it belongs to
// the hosting setup.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' }, // no clickjacking in someone else's frame
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

export default withNextIntl(
  withSerwist({
    reactStrictMode: true,
    poweredByHeader: false,
    turbopack: {},
    async headers() {
      return [{ source: '/:path*', headers: securityHeaders }];
    },
  })
);
