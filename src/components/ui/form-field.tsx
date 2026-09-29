import type { ReactNode } from "react";

type FormFieldProps = {
  /** id of the input inside, so the label points at it. */
  id: string;
  label: string;
  /** Small grey text after the label, e.g. "optional". */
  labelHint?: string;
  error?: string;
  children: ReactNode;
  /** Anything under the input, e.g. a rules checklist. */
  footer?: ReactNode;
};

// Label + input + error text. The error gets id `${id}-error`, so the input
// can point at it with aria-describedby.
export function FormField({ id, label, labelHint, error, children, footer }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-app-text">
        {label}
        {labelHint && <span className="ml-1.5 text-xs font-normal text-app-text-muted">({labelHint})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
      {footer}
    </div>
  );
}
