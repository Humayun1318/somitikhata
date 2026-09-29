import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Shared look for text-like controls (Input, Select), so they always match.
export const inputBaseClass =
  "w-full rounded-lg border border-app-border bg-app-surface px-3.5 py-2.5 text-sm text-app-text transition-colors placeholder:text-app-text-muted/60 focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-focus disabled:cursor-not-allowed disabled:bg-app-surface-muted disabled:opacity-50";

export const inputErrorClass = "border-red-600 focus:border-red-600 focus:ring-red-600/30";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  error?: boolean;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(inputBaseClass, error && inputErrorClass, className)}
      {...props}
    />
  );
}
