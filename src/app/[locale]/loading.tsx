export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-app-background"
    >
      <div className="mx-auto w-full max-w-app-wide px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          {/* Page header */}
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-lg bg-app-surface-muted" />
            <div className="h-4 w-64 max-w-full rounded bg-app-surface-muted" />
          </div>

          {/* Main cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
          </div>

          {/* Main content */}
          <div className="h-64 rounded-2xl bg-app-surface-muted" />
        </div>
      </div>
    </main>
  );
}