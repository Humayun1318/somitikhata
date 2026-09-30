"use client";

import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  /** Set false while a request runs, so Esc, backdrop and X can't close it mid-submit. */
  dismissible?: boolean;
  /** "md" for short forms (default), "lg" for longer forms and details. */
  size?: "md" | "lg";
  /** Sticky footer, usually <DialogActions />. */
  footer?: ReactNode;
  /** Given: the body and footer are one <form>, so a submit button in the footer submits it. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Marks the form busy for assistive tech while it submits. */
  busy?: boolean;
  children: ReactNode;
};

/**
 * The one modal for the whole app, built on the native <dialog>: focus is
 * trapped, Esc works, and it sits in the browser's top layer, with no package.
 *
 * Layout: sticky header (title + description + close) / scrolling body /
 * sticky footer. Only the body scrolls, so the title and the action buttons
 * stay visible on long forms. Mobile: bottom sheet. sm and up: centered card.
 *
 * Toasts and SelectMenu panels also use the top layer, so they show above it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  dismissible = true,
  size = "md",
  footer,
  onSubmit,
  busy,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Focus the field marked data-autofocus, but only with a mouse/trackpad:
      // on phones, popping the keyboard mid-animation feels jumpy.
      if (window.matchMedia("(pointer: fine)").matches) {
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Esc fires "cancel". Always prevent the native close, so React state stays the source of truth.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (dismissible) onClose();
  };

  // Close on backdrop click only when the press also started on the backdrop,
  // so selecting text in an input and releasing outside does not close it.
  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  };
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const isBackdrop = event.target === event.currentTarget && pressStartedOnBackdrop.current;
    if (isBackdrop && dismissible) onClose();
  };

  const handleCloseButton = () => {
    if (dismissible) onClose();
  };

  const describedBy = description ? descriptionId : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={cn(
        "fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-app-surface p-0 text-app-text shadow-2xl",
        "sm:inset-0 sm:m-auto sm:max-h-[min(85dvh,52rem)] sm:rounded-2xl sm:border sm:border-app-border/70",
        size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md",
        "backdrop:bg-slate-950/45 backdrop:backdrop-blur-[3px]",
        "opacity-0 translate-y-6 sm:translate-y-2 sm:scale-[0.97]",
        "open:opacity-100 open:translate-y-0 sm:open:scale-100",
        "starting:open:opacity-0 starting:open:translate-y-6 sm:starting:open:translate-y-2 sm:starting:open:scale-[0.97]",
        "transition-[opacity,translate,scale,display,overlay] transition-discrete duration-200 ease-out",
        "backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-200 backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        "motion-reduce:transition-none",
      )}
    >
      {/* The flex column lives inside, so the closed <dialog> keeps display:none. */}
      <div className="flex max-h-[inherit] flex-col">
        <header className="shrink-0 border-b border-app-border/70 px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-app-border sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold leading-snug tracking-tight text-app-text">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-app-text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseButton}
              disabled={!dismissible}
              aria-label={closeLabel}
              className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text disabled:opacity-50"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <DialogContent onSubmit={onSubmit} busy={busy}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
          {footer && (
            <footer className="shrink-0 border-t border-app-border/70 bg-app-surface-muted/40 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-4">
              {footer}
            </footer>
          )}
        </DialogContent>
      </div>
    </dialog>
  );
}

type DialogContentProps = {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  children: ReactNode;
};

// Body + footer as one <form> (form dialogs) or a plain block (details dialogs).
function DialogContent({ onSubmit, busy, children }: DialogContentProps) {
  const className = "flex min-h-0 flex-1 flex-col";

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} noValidate aria-busy={busy} className={className}>
        {children}
      </form>
    );
  }
  return <div className={className}>{children}</div>;
}
