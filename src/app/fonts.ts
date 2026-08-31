import { Hind_Siliguri, Inter } from 'next/font/google';

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  display: 'swap',
  preload: false,
});
