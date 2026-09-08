export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-app-background px-4"
    >
      <div className="flex flex-col items-center">
        <div
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-4 border-app-border border-t-app-primary"
        />

        <p className="mt-4 text-sm font-medium text-app-text-muted">
          Loading...
        </p>
      </div>
    </main>
  );
}