'use client';

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <section
            role="alert"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
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

            <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Application error
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Something went wrong while loading the application.
              Please try again.
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-7 min-h-11 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}