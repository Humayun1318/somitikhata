import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SomitiKhata',
    short_name: 'SomitiKhata',
    description: 'Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative societies.',
    start_url: '/bn',
    display: 'standalone',
    background_color: '#F7F8F7',
    theme_color: '#0F6B4F',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
