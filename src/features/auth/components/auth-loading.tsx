export function AuthLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-app-background"
    >
      <div
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-4 border-app-border border-t-app-primary"
      />
    </div>
  );
}