import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

import { inputBaseClass, inputErrorClass } from "./input";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  error?: boolean;
};

// Multi-line Input with the same look. Works with react-hook-form's register().
export function Textarea({ className, error, rows = 3, ...props }: TextareaProps) {
  return <textarea rows={rows} className={cn(inputBaseClass, "resize-y", error && inputErrorClass, className)} {...props} />;
}
