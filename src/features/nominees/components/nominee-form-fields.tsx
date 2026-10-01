"use client";

import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

import { AddressFields } from "@/components/shared/address-fields";
import { FormSection } from "@/components/shared/form-section";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { toDhakaDateString } from "@/lib/dhaka-date";

import { isMinorDob, type NomineeInput } from "../schemas";
import { NOMINEE_ID_TYPES, NOMINEE_RELATIONS } from "../types";

type NomineeFormFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  control: Control<T>;
  /** errors.nominee of the form. */
  errors?: FieldErrors<NomineeInput>;
  readOnly: boolean;
  /** Shown under the first section title (e.g. "You can add a second one later"). */
  hint?: string;
  /** Focus the name field when the dialog opens (standalone nominee dialog). */
  autoFocus?: boolean;
};

// The nominee part of a form. The values live under `nominee` in both the
// Add member form and the Add/Edit nominee dialog, so these fields serve both.
// Relation note shows for "other", ID number after an ID type is chosen, and
// the guardian section once the date of birth makes the nominee under 18.
export function NomineeFormFields<T extends FieldValues>({
  register,
  control,
  errors,
  readOnly,
  hint,
  autoFocus = false,
}: NomineeFormFieldsProps<T>) {
  const t = useTranslations("Nominees");
  const path = (name: string) => `nominee.${name}` as Path<T>;
  const [relation, dob, idType] = useWatch({
    control,
    name: [path("relation"), path("dob"), path("idType")],
  });
  const isMinor = isMinorDob((dob as string) ?? "");
  const today = toDhakaDateString();
  const optional = t("optional");

  const relationOptions = [
    { value: "", label: t("form.select") },
    ...NOMINEE_RELATIONS.map((value) => ({
      value,
      label: t(`relation.${value}`),
    })),
  ];
  const idTypeOptions = [
    { value: "", label: t("idType.none") },
    ...NOMINEE_ID_TYPES.map((value) => ({
      value,
      label: t(`idType.${value}`),
    })),
  ];
  const idNumberPlaceholder = idType ? t(`placeholders.idNumber_${idType as string}`) : "";

  const fieldId = (name: string) => `nominee-${name}`;
  const inputProps = (name: string, message?: string) => ({
    id: fieldId(name),
    readOnly,
    error: !!message,
    "aria-invalid": !!message,
    "aria-describedby": message ? `${fieldId(name)}-error` : undefined,
    autoComplete: "off",
    className: "min-h-11",
  });
  const guardianErrors = errors?.guardian;

  return (
    <>
      <FormSection title={t("form.detailsTitle")} hint={hint}>
        <FormField id={fieldId("name")} label={t("fields.name")} error={errors?.name?.message}>
          <Input
            {...inputProps("name", errors?.name?.message)}
            data-autofocus={autoFocus || undefined}
            placeholder={t("placeholders.name")}
            {...register(path("name"))}
          />
        </FormField>

        <FormField id={fieldId("relation")} label={t("fields.relation")} error={errors?.relation?.message}>
          <Controller
            control={control}
            name={path("relation")}
            render={({ field }) => (
              <SelectMenu
                id={fieldId("relation")}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={relationOptions}
                disabled={readOnly}
                error={!!errors?.relation}
                aria-describedby={errors?.relation ? `${fieldId("relation")}-error` : undefined}
              />
            )}
          />
        </FormField>

        {relation === "other" && (
          <FormField
            id={fieldId("relationNote")}
            label={t("fields.relationNote")}
            error={errors?.relationNote?.message}
          >
            <Input
              {...inputProps("relationNote", errors?.relationNote?.message)}
              maxLength={30}
              placeholder={t("placeholders.relationNote")}
              {...register(path("relationNote"))}
            />
          </FormField>
        )}

        <FormField id={fieldId("phone")} label={t("fields.phone")} labelHint={optional} error={errors?.phone?.message}>
          <Input
            {...inputProps("phone", errors?.phone?.message)}
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder={t("placeholders.phone")}
            {...register(path("phone"))}
          />
        </FormField>

        <FormField id={fieldId("dob")} label={t("fields.dob")} labelHint={optional} error={errors?.dob?.message}>
          <Input {...inputProps("dob", errors?.dob?.message)} type="date" max={today} {...register(path("dob"))} />
        </FormField>

        <FormField
          id={fieldId("idType")}
          label={t("fields.idType")}
          labelHint={optional}
          error={errors?.idType?.message}
        >
          <Controller
            control={control}
            name={path("idType")}
            render={({ field }) => (
              <SelectMenu
                id={fieldId("idType")}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={idTypeOptions}
                disabled={readOnly}
                error={!!errors?.idType}
              />
            )}
          />
        </FormField>

        {!!idType && (
          <FormField id={fieldId("idNumber")} label={t("fields.idNumber")} error={errors?.idNumber?.message}>
            <Input
              {...inputProps("idNumber", errors?.idNumber?.message)}
              inputMode={idType === "passport" ? "text" : "numeric"}
              maxLength={20}
              placeholder={idNumberPlaceholder}
              {...register(path("idNumber"))}
            />
          </FormField>
        )}
      </FormSection>

      {isMinor && (
        <FormSection title={t("form.guardianTitle")} hint={t("form.guardianHint")}>
          <FormField
            id={fieldId("guardian-name")}
            label={t("fields.guardianName")}
            error={guardianErrors?.name?.message}
          >
            <Input
              {...inputProps("guardian-name", guardianErrors?.name?.message)}
              placeholder={t("placeholders.guardianName")}
              {...register(path("guardian.name"))}
            />
          </FormField>
          <FormField
            id={fieldId("guardian-relation")}
            label={t("fields.guardianRelation")}
            error={guardianErrors?.relation?.message}
          >
            <Input
              {...inputProps("guardian-relation", guardianErrors?.relation?.message)}
              maxLength={30}
              placeholder={t("placeholders.guardianRelation")}
              {...register(path("guardian.relation"))}
            />
          </FormField>
          <FormField
            id={fieldId("guardian-phone")}
            label={t("fields.guardianPhone")}
            labelHint={optional}
            error={guardianErrors?.phone?.message}
          >
            <Input
              {...inputProps("guardian-phone", guardianErrors?.phone?.message)}
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder={t("placeholders.phone")}
              {...register(path("guardian.phone"))}
            />
          </FormField>
          <p className="flex items-start gap-2 self-end rounded-xl bg-app-surface-muted/70 p-3 text-xs text-app-text-muted">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("form.guardianNote")}
          </p>
        </FormSection>
      )}

      <FormSection title={t("form.addressTitle")} hint={t("form.addressHint")}>
        <AddressFields name="nominee.address" register={register} errors={errors?.address} readOnly={readOnly} />
      </FormSection>
    </>
  );
}
