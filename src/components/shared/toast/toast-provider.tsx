"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info" | "loading";

type ToastItem = { id: number; type: ToastType; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  /** Stays until dismiss(id) is called. Returns the toast id. */
  loading: (message: string) => number;
  dismiss: (id: number) => void;
};

const AUTO_DISMISS_MS = 5000;
const MAX_VISIBLE = 4;

const ToastContext = createContext<ToastApi | null>(null);

const BOX_STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-app-border bg-app-surface text-app-text",
  loading: "border-app-border bg-app-surface text-app-text",
};

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

function ToastIcon({ type }: { type: ToastType }) {
  const Icon = type === "loading" ? null : ICONS[type];

  return (
    <>
      {Icon && <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
      {!Icon && <Spinner className="mt-0.5 text-app-primary" />}
    </>
  );
}

/**
 * Global toasts. Callers pass an already translated string:
 *   const toast = useToast();
 *   const t = useTranslations("Feature");
 *   toast.error(t("saveFailed"));
 * Keep the message keys in the feature's own messages file.
 *
 * Loading toasts for API actions are shown automatically by
 * MutationLoadingToasts; you rarely call toast.loading() yourself.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Toast");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const containerRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, type, message }].slice(-MAX_VISIBLE));
      if (type !== "loading") {
        timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
      }
      return id;
    },
    [dismiss],
  );

  // Stable object, so putting `toast` in an effect's deps does not re-fire it.
  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => void push("success", message),
      error: (message) => void push("error", message),
      info: (message) => void push("info", message),
      loading: (message) => push("loading", message),
      dismiss,
    }),
    [push, dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  // The container is a popover, which lives in the browser's top layer.
  // Re-opening it on every change puts it above any open <dialog>, so toasts
  // stay visible while a modal is open. Older browsers fall back to z-index.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof container.showPopover !== "function") return;

    if (container.matches(":popover-open")) container.hidePopover();
    if (toasts.length > 0) container.showPopover();
  }, [toasts]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        ref={containerRef}
        popover="manual"
        aria-live="polite"
        className="pointer-events-none fixed inset-auto top-4 right-4 left-4 z-100 m-0 flex h-auto w-auto flex-col gap-2 overflow-visible border-0 bg-transparent p-0 sm:left-auto sm:w-96"
      >
        {toasts.map(({ id, type, message }) => (
          <div
            key={id}
            role={type === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-3 text-sm shadow-md",
              BOX_STYLES[type],
            )}
          >
            <ToastIcon type={type} />
            <p className="flex-1">{message}</p>
            <button
              type="button"
              onClick={() => dismiss(id)}
              aria-label={t("close")}
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
