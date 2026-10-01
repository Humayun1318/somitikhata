"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";

import { AddressFields } from "@/components/shared/address-fields";
import { FormSection } from "@/components/shared/form-section";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";

import { toDhakaDateString } from "@/lib/dhaka-date";
import { NomineeFormFields } from "@/features/nominees/components/nominee-form-fields";

import type { CreateMemberInput } from "../schemas";

type MemberFormFieldsProps = {
  register: UseFormRegister<CreateMemberInput>;
  control: Control<CreateMemberInput>;
  errors: FieldErrors<CreateMemberInput>;
  /** True while saving: fields can't be edited. */
  readOnly: boolean;
  /** Add member: the first nominee is part of the form. */
  showNominee: boolean;
  /** Fills the permanent address with the present one. */
  onCopyPresentAddress: () => void;
};

type TextField =
  | "nameBn"
  | "nameEn"
  | "guardianName"
  | "phone"
  | "nid"
  | "dob"
  | "joinDate"
  | "admissionFormNo"
  | "businessName"
  | "marketOrRoad"
  | "businessType";

// The admission-form fields, in sections: member, business, present and
// permanent address, and (add only) the first nominee.
// Required: name (Bangla), mobile, NID, join date, business, upazila + district.
export function MemberFormFields({
  register,
  control,
  errors,
  readOnly,
  showNominee,
  onCopyPresentAddress,
}: MemberFormFieldsProps) {
  const t = useTranslations("MemberForm");
  const optional = t("optional");
  const today = toDhakaDateString();
  const relationOptions = [
    { value: "", label: t("relation.none") },
    { value: "father", label: t("relation.father") },
    { value: "spouse", label: t("relation.spouse") },
  ];
  const errorId = (name: TextField) => (errors[name] ? `${name}-error` : undefined);
  const inputProps = (name: TextField) => ({
    id: name,
    readOnly,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errorId(name),
    className: "min-h-11",
  });

  return (
    <div className="space-y-5">
      <FormSection title={t("sections.member")}>
        <FormField id="nameBn" label={t("fields.nameBn")} error={errors.nameBn?.message}>
          <Input
            {...inputProps("nameBn")}
            data-autofocus
            autoComplete="off"
            placeholder={t("placeholders.nameBn")}
            {...register("nameBn")}
          />
        </FormField>

        <FormField id="nameEn" label={t("fields.nameEn")} labelHint={optional} error={errors.nameEn?.message}>
          <Input
            {...inputProps("nameEn")}
            autoComplete="off"
            placeholder={t("placeholders.nameEn")}
            {...register("nameEn")}
          />
        </FormField>

        <FormField
          id="guardianName"
          label={t("fields.guardianName")}
          labelHint={optional}
          error={errors.guardianName?.message}
        >
          <Input
            {...inputProps("guardianName")}
            autoComplete="off"
            placeholder={t("placeholders.guardianName")}
            {...register("guardianName")}
          />
        </FormField>

        <FormField
          id="guardianRelation"
          label={t("fields.guardianRelation")}
          labelHint={optional}
          error={errors.guardianRelation?.message}
        >
          <Controller
            control={control}
            name="guardianRelation"
            render={({ field }) => (
              <SelectMenu
                id="guardianRelation"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={relationOptions}
                disabled={readOnly}
                error={!!errors.guardianRelation}
              />
            )}
          />
        </FormField>

        <FormField id="phone" label={t("fields.phone")} error={errors.phone?.message}>
          <Input
            {...inputProps("phone")}
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            placeholder={t("placeholders.phone")}
            {...register("phone")}
          />
        </FormField>

        <FormField id="nid" label={t("fields.nid")} error={errors.nid?.message}>
          <Input
            {...inputProps("nid")}
            inputMode="numeric"
            autoComplete="off"
            maxLength={17}
            placeholder={t("placeholders.nid")}
            {...register("nid")}
          />
        </FormField>

        <FormField id="joinDate" label={t("fields.joinDate")} error={errors.joinDate?.message}>
          <Input {...inputProps("joinDate")} type="date" max={today} {...register("joinDate")} />
        </FormField>

        <FormField id="dob" label={t("fields.dob")} labelHint={optional} error={errors.dob?.message}>
          <Input {...inputProps("dob")} type="date" max={today} {...register("dob")} />
        </FormField>

        <FormField
          id="admissionFormNo"
          label={t("fields.admissionFormNo")}
          labelHint={optional}
          error={errors.admissionFormNo?.message}
        >
          <Input
            {...inputProps("admissionFormNo")}
            autoComplete="off"
            maxLength={30}
            placeholder={t("placeholders.admissionFormNo")}
            {...register("admissionFormNo")}
          />
        </FormField>
      </FormSection>

      <FormSection title={t("sections.business")}>
        <FormField id="businessName" label={t("fields.businessName")} error={errors.businessName?.message}>
          <Input
            {...inputProps("businessName")}
            autoComplete="off"
            maxLength={100}
            placeholder={t("placeholders.businessName")}
            {...register("businessName")}
          />
        </FormField>
        <FormField id="businessType" label={t("fields.businessType")} error={errors.businessType?.message}>
          <Input
            {...inputProps("businessType")}
            autoComplete="off"
            maxLength={50}
            placeholder={t("placeholders.businessType")}
            {...register("businessType")}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="marketOrRoad" label={t("fields.marketOrRoad")} error={errors.marketOrRoad?.message}>
            <Input
              {...inputProps("marketOrRoad")}
              autoComplete="off"
              maxLength={100}
              placeholder={t("placeholders.marketOrRoad")}
              {...register("marketOrRoad")}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title={t("sections.presentAddress")} hint={t("sections.presentAddressHint")}>
        <AddressFields
          name="presentAddress"
          register={register}
          errors={errors.presentAddress}
          readOnly={readOnly}
          required
        />
      </FormSection>

      <FormSection
        title={t("sections.permanentAddress")}
        hint={t("sections.permanentAddressHint")}
        action={
          <button
            type="button"
            onClick={onCopyPresentAddress}
            disabled={readOnly}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-app-primary transition-colors hover:bg-app-primary/10 focus-visible:outline-2 focus-visible:outline-app-focus disabled:opacity-50"
          >
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
            {t("sameAsPresent")}
          </button>
        }
      >
        <AddressFields
          name="permanentAddress"
          register={register}
          errors={errors.permanentAddress}
          readOnly={readOnly}
        />
      </FormSection>

      {showNominee && (
        <NomineeFormFields
          register={register}
          control={control}
          errors={errors.nominee}
          readOnly={readOnly}
          hint={t("sections.nomineeHint")}
        />
      )}
    </div>
  );
}
