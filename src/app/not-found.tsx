import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-sm font-semibold text-[var(--color-primary)]">404</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--color-text)]">Page not found</h1>
        <Link
          href="/bn"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-white"
        >
          Go home
        </Link>
      </section>
    </main>
  );
}
