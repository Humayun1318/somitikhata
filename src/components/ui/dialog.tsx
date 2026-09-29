"use client";

import {
  useEffect,
  useId,
  useRef,
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
  children: ReactNode;
};

/**
 * Modal built on the native <dialog>: focus is trapped, Esc works, and it sits
 * in the browser's top layer, all with no extra package.
 * Mobile: bottom sheet. sm and up: centered card.
 *
 * Note: toasts render below the top layer, so they are hidden while a dialog
 * is open. Show errors inside the dialog; toast only after it closes.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  dismissible = true,
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
        "fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-app-surface p-0 text-app-text shadow-2xl",
        "sm:inset-0 sm:m-auto sm:max-h-[85dvh] sm:max-w-md sm:rounded-2xl",
        "backdrop:bg-black/40 backdrop:backdrop-blur-[2px]",
        "opacity-0 translate-y-6 sm:translate-y-2 sm:scale-95",
        "open:opacity-100 open:translate-y-0 sm:open:scale-100",
        "starting:open:opacity-0 starting:open:translate-y-6 sm:starting:open:translate-y-2 sm:starting:open:scale-95",
        "transition-[opacity,translate,scale,display,overlay] transition-discrete duration-200 ease-out",
        "motion-reduce:transition-none",
      )}
    >
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6 sm:pt-6">
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-app-border sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-app-text">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-app-text-muted">
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

        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
