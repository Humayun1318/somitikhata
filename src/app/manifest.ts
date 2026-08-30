import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SomitiKhata',
    short_name: 'SomitiKhata',
    description: 'Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative societies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F8F7',
    theme_color: '#0F6B4F',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
