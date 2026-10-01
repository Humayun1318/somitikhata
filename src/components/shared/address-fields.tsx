"use client";

import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { AddressInput } from "@/lib/address";
import { ADDRESS_PARTS, type AddressPart } from "@/types/address";

type AddressFieldsProps<T extends FieldValues> = {
  /** Form path of the address object, e.g. "presentAddress" or "nominee.address". */
  name: string;
  register: UseFormRegister<T>;
  errors?: FieldErrors<AddressInput>;
  readOnly: boolean;
  /** Upazila and district are required (member's present address). */
  required?: boolean;
};

// The five address inputs (village → district). Rendered inside a FormSection grid.
export function AddressFields<T extends FieldValues>({
  name,
  register,
  errors,
  readOnly,
  required = false,
}: AddressFieldsProps<T>) {
  const t = useTranslations("Address");
  const isRequired = (part: AddressPart) => required && (part === "upazila" || part === "district");
  const fields = ADDRESS_PARTS.map((part) => {
    const id = `${name.replace(".", "-")}-${part}`;
    const message = errors?.[part]?.message;
    return { part, id, message, hint: isRequired(part) ? undefined : t("optional") };
  });

  return (
    <>
      {fields.map(({ part, id, message, hint }) => (
        <FormField key={part} id={id} label={t(`fields.${part}`)} labelHint={hint} error={message}>
          <Input
            id={id}
            readOnly={readOnly}
            error={!!message}
            aria-invalid={!!message}
            aria-describedby={message ? `${id}-error` : undefined}
            autoComplete="off"
            maxLength={50}
            placeholder={t(`placeholders.${part}`)}
            className="min-h-11"
            {...register(`${name}.${part}` as Path<T>)}
          />
        </FormField>
      ))}
    </>
  );
}
