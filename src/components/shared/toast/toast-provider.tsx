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

import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";

type ToastItem = { id: number; type: ToastType; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const AUTO_DISMISS_MS = 5000;
const MAX_VISIBLE = 4;

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<ToastType, { box: string; icon: typeof Info }> = {
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CircleCheck },
  error: { box: "border-red-200 bg-red-50 text-red-700", icon: CircleAlert },
  info: { box: "border-app-border bg-app-surface text-app-text", icon: Info },
};

/**
 * Global toasts. Callers pass an already translated string:
 *   const toast = useToast();
 *   const t = useTranslations("Feature");
 *   toast.error(t("saveFailed"));
 * Keep the message keys in the feature's own messages file.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Toast");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, type, message }].slice(-MAX_VISIBLE));
      timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    },
    [dismiss],
  );

  // Stable object, so putting `toast` in an effect's deps does not re-fire it.
  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-100 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96"
      >
        {toasts.map(({ id, type, message }) => {
          const { box, icon: Icon } = STYLES[type];
          return (
            <div
              key={id}
              role={type === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-3 text-sm shadow-md",
                box,
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
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
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
