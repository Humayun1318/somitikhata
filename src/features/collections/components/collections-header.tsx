import type { ReactNode } from "react";

type CollectionsHeaderProps = { title: string; subtitle: string; children?: ReactNode };

// Page title + subtitle, with the page's main action on the right (below on phones).
export function CollectionsHeader({ title, subtitle, children }: CollectionsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-app-text">{title}</h1>
        <p className="mt-1 text-sm text-app-text-muted">{subtitle}</p>
      </div>
      {children}
    </header>
  );
}
