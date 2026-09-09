import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
};

export function Button({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-app-focus disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-app-primary text-white hover:bg-app-primary-hover active:scale-[0.99]',
    secondary:
      'bg-app-secondary text-white hover:bg-app-secondary/90 active:scale-[0.99]',
    outline:
      'border border-app-border bg-app-surface text-app-text hover:bg-app-surface-muted active:scale-[0.99]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}