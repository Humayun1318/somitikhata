"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";

import { Input } from "./input";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "type"> & {
  showLabel: string;
  hideLabel: string;
};

// Input with a show/hide toggle. Works with react-hook-form's register() (ref is a prop in React 19).
export function PasswordInput({ showLabel, hideLabel, className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const inputType = isVisible ? "text" : "password";
  const toggleLabel = isVisible ? hideLabel : showLabel;
  const ToggleIcon = isVisible ? EyeOff : Eye;
  const toggleVisibility = () => setIsVisible((visible) => !visible);

  return (
    <div className="relative">
      <Input type={inputType} className={cn("min-h-11 pr-12", className)} {...props} />
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-app-text-muted transition-colors hover:text-app-text"
      >
        <ToggleIcon aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
