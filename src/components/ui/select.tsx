import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

import { inputBaseClass, inputErrorClass } from "./input";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  error?: boolean;
};

// Native <select> styled like Input. Native keeps it simple and gives phones
// their own picker. Works with react-hook-form's register().
export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(inputBaseClass, "appearance-none pr-10", error && inputErrorClass, className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted"
      />
    </div>
  );
}
