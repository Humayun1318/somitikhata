import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

type PageContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: 'content' | 'wide' | 'full';
};

const sizeClasses = {
  content: 'max-w-3xl',
  wide: 'max-w-app-wide',
  full: 'max-w-none',
} as const;

export function PageContainer({
  className,
  size = 'wide',
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export type { PageContainerProps };
