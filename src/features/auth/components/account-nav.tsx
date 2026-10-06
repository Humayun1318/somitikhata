"use client";

import { LogIn } from "lucide-react";

import { ProfileMenu } from "@/features/dashboard/components/profile-menu";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

import { useMe } from "../hooks/use-me";

type AccountNavProps = {
  loginLabel: string;
  /** "bar": the top bar (avatar menu or a compact Sign in). "menu": the mobile menu (guests only). */
  placement: "bar" | "menu";
  onNavigate?: () => void;
};

// The public navbar's account slot. Signed in: the same avatar menu as the
// dashboard header (dashboard, profile, logout). Guest: Sign in. Nothing shows
// until GET /user/me answers, so a signed-in user never sees Sign in flash.
export function AccountNav({ loginLabel, placement, onNavigate }: AccountNavProps) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return placement === "bar" ? (
      <span aria-hidden="true" className="h-9 w-9 animate-pulse rounded-full bg-app-surface-muted" />
    ) : null;
  }

  if (user) return placement === "bar" ? <ProfileMenu variant="public" /> : null;

  return (
    <Link
      href="/login"
      onClick={onNavigate}
      className={cn(
        "items-center justify-center gap-2 rounded-lg bg-app-primary text-sm font-semibold text-white transition-colors hover:bg-app-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus",
        placement === "bar" ? "hidden min-h-10 px-4 sm:inline-flex" : "mt-2 flex min-h-12 px-4",
      )}
    >
      <LogIn aria-hidden="true" className="h-4 w-4" />
      {loginLabel}
    </Link>
  );
}
