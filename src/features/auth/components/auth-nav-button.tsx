"use client";

import { Link } from "@/i18n/navigation";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useMe } from "@/features/auth/hooks/use-me";

type AuthNavButtonProps = {
  variant: "desktop" | "mobile";
  loginLabel: string;
  logoutLabel: string;
  onNavigate?: () => void;
};

const STYLES = {
  desktop: {
    button:
      "hidden rounded-xl bg-app-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-primary-hover focus-visible:outline-2 focus-visible:outline-app-focus disabled:opacity-60 sm:inline-flex",
    placeholder: "hidden h-9 w-20 animate-pulse rounded-xl bg-app-surface-muted sm:inline-flex",
  },
  mobile: {
    button:
      "mt-2 rounded-xl bg-app-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-primary-hover disabled:opacity-60",
    placeholder: "mt-2 h-11 w-full animate-pulse rounded-xl bg-app-surface-muted",
  },
} as const;

// Login for guests, Logout for a signed-in user. State comes from useMe()
// (GET /user/me), the same source AuthGate uses, so nothing extra is fetched.
export function AuthNavButton({
  variant,
  loginLabel,
  logoutLabel,
  onNavigate,
}: AuthNavButtonProps) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const styles = STYLES[variant];

  // Wait for the first check so a signed-in user never sees a Login flash.
  const showPlaceholder = isLoading;
  const showLogout = !isLoading && !!user;
  const showLogin = !isLoading && !user;

  const handleLogout = () => {
    onNavigate?.();
    logout.mutate();
  };

  return (
    <>
      {showPlaceholder && (
        <span aria-hidden="true" className={styles.placeholder} />
      )}
      {showLogout && (
        <button
          type="button"
          disabled={logout.isPending}
          onClick={handleLogout}
          className={styles.button}
        >
          {logoutLabel}
        </button>
      )}
      {showLogin && (
        <Link
          href="/login"
          onClick={onNavigate}
          className={`${styles.button} inline-flex`}
        >
          {loginLabel}
        </Link>
      )}
    </>
  );
}
