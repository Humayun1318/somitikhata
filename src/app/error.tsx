'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          The page could not be loaded. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-11 rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
