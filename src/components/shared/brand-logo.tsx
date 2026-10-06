import Image from 'next/image';
import { cn } from '@/lib/cn';

type BrandLogoProps = {
  variant?: 'compact' | 'full';
  className?: string;
  imageClassName?: string;
  showLegalName?: boolean;
  shortName?: string;
  registration?: string;
  legalName: string;
  location: string;
};


export function BrandLogo({
  variant = 'compact',
  className,
  imageClassName,
  showLegalName = false,
  shortName,
  registration,
  legalName,
  location
}: BrandLogoProps) {
  const isFull = variant === 'full';

  // Display only. To make it a home link, wrap it in <Link href="/"> (as the
  // navbar and dashboard do): a client navigation that keeps the locale and the
  // cache, works with the keyboard, and never nests two links.
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <Image
        src="/branding/logo-mark-removebg-preview.png"
        alt="BKS logo"
        width={isFull ? 48 : 40}
        height={isFull ? 48 : 40}
        className={cn('h-10 w-10 shrink-0 object-contain', imageClassName)}
        priority={isFull}
      />
      <span className="min-w-0">
        <span className="block truncate font-bold text-app-primary text-sm sm:text-base">
          {shortName}<br className="" />
          <span className="block max-w-xs text-xs leading-5 text-app-text-muted">
            <span className="block">{registration}</span>
          </span>
        </span>
        {(isFull || showLegalName) && (
          <span className="block max-w-xs text-xs leading-5 text-app-text-muted">
            {legalName}
            <span className="block">{location} {registration}</span>
          </span>
        )}
      </span>
    </span>
  );
}


export type { BrandLogoProps };
