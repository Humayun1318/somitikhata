import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-8 text-center shadow-sm sm:p-10">
        <div aria-hidden="true" className="select-none">
          <p className="text-7xl font-bold leading-none tracking-tighter text-app-primary/15 sm:text-8xl">
            404
          </p>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-semibold tracking-tight text-app-text sm:text-2xl">
            Page not found
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-app-text-muted">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved.
          </p>
        </div>

        <Link
          href="/bn"
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-app-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
        >
          Go home
        </Link>
      </section>
    </main>
  );
}