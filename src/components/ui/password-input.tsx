"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import { Input } from "./input";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "type">;

/**
 * The one password field for the whole app (login, register, change password).
 * Adds a show/hide toggle; the toggle's label comes from the "PasswordInput"
 * messages, so callers only pass normal input props.
 * Works with react-hook-form's register(): in React 19 `ref` is a normal prop.
 */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const t = useTranslations("PasswordInput");
  const [isVisible, setIsVisible] = useState(false);

  const inputType = isVisible ? "text" : "password";
  const toggleLabel = isVisible ? t("hide") : t("show");
  const ToggleIcon = isVisible ? EyeOff : Eye;
  const toggleVisibility = () => setIsVisible((visible) => !visible);

  return (
    <div className="relative">
      <Input
        type={inputType}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn("min-h-11 pr-12", className)}
        {...props}
      />
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
