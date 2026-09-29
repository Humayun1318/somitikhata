"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useMe } from "@/features/auth/hooks/use-me";
import {
  getProfileRoute,
  getRoleArea,
  getSettingsRoute,
} from "@/features/auth/role-routes";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const ITEM_CLASS =
  "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-app-focus sm:min-h-11 sm:py-2.5";

// Avatar button in the dashboard header. Opens the account menu:
// profile, settings and logout. User data comes from useMe() (GET /user/me).
export function ProfileMenu() {
  const t = useTranslations("DashboardHeader");
  const { data: user } = useMe();
  const logout = useLogout();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const area = getRoleArea(user?.role ?? "member");
  const isStaff = area === "admin";
  const name = user?.name ?? "";
  const identifier = isStaff ? user?.staffNo : user?.memberNo;
  const identifierLabel = isStaff ? t("staffNo") : t("memberNo");

  const menuItems = [
    { href: getProfileRoute(area), label: t("profile"), icon: "User" },
    { href: getSettingsRoute(area), label: t("settings"), icon: "Settings" },
  ];

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((open) => !open);

  // The menu stays open while logging out, so the spinner is visible.
  // Logout then redirects to the login page.
  const handleLogout = () => logout.mutate();
  const isLoggingOut = logout.isPending;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("menuLabel")}
        className="flex min-h-11 items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-app-surface-muted focus-visible:outline-2 focus-visible:outline-app-focus md:rounded-xl md:py-1 md:pr-3"
      >
        <UserAvatar name={name} size="sm" />

        <span className="hidden min-w-0 max-w-48 flex-col text-left md:flex">
          <span className="truncate text-sm font-semibold leading-tight text-app-text">
            {name}
          </span>
          {identifier && (
            <span className="truncate text-xs leading-tight text-app-text-muted">
              {identifierLabel}:{" "}
              <span className="font-mono font-medium">{identifier}</span>
            </span>
          )}
        </span>

        <DynamicIcon
          name="ChevronDown"
          className={cn(
            "hidden h-4 w-4 text-app-text-muted transition-transform duration-150 md:block",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        role="menu"
        aria-label={t("menuLabel")}
        aria-hidden={!isOpen}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-app-border bg-app-surface p-2 shadow-lg",
          "transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none",
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <UserAvatar name={name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app-text">{name}</p>
            {identifier && (
              <p className="truncate text-xs text-app-text-muted">
                {identifierLabel}:{" "}
                <span className="font-mono font-medium">{identifier}</span>
              </p>
            )}
          </div>
        </div>

        <div className="my-1 border-t border-app-border" />

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            role="menuitem"
            onClick={closeMenu}
            className={cn(ITEM_CLASS, "text-app-text hover:bg-app-surface-muted")}
          >
            <DynamicIcon name={item.icon} className="h-5 w-5 shrink-0 text-app-text-muted" />
            {item.label}
          </Link>
        ))}

        <div className="my-1 border-t border-app-border" />

        <button
          type="button"
          role="menuitem"
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          onClick={handleLogout}
          className={cn(ITEM_CLASS, "text-red-600 hover:bg-red-50 disabled:opacity-60")}
        >
          {isLoggingOut && <Spinner className="h-5 w-5" />}
          {!isLoggingOut && <DynamicIcon name="LogOut" className="h-5 w-5 shrink-0" />}
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
