import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/bn',
    name: 'লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতি লিঃ',
    short_name: 'বটতলী সমবায়',
    description: 'লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির সদস্য, সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনার ডিজিটাল প্ল্যাটফর্ম।',
    start_url: '/bn',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F8F7',
    theme_color: '#0F6B4F',
    icons: [
      {
        src: '/branding/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/branding/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/branding/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/branding/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
