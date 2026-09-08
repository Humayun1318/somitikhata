"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4 py-8 sm:px-6">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 text-center shadow-sm sm:p-8"
      >
        {/* Error icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg
            aria-hidden="true"
            className="h-7 w-7 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.6 2.9 17a2 2 0 0 0 1.75 3h14.7a2 2 0 0 0 1.75 3L13.7 3.6a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-app-text-muted">
          {t("description")}
        </p>

        {/* Retry */}
        <button
          type="button"
          onClick={reset}
          className="mt-7 min-h-11 w-full rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
        >
          {t("retry")}
        </button>
      </section>
    </main>
  );
}
