"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { todayDateString, type CreateMemberInput } from "../schemas";

type AddMemberFieldsProps = {
  register: UseFormRegister<CreateMemberInput>;
  errors: FieldErrors<CreateMemberInput>;
  /** True while saving: fields can't be edited. */
  readOnly: boolean;
};

// The admission-form fields. Required: name (Bangla), mobile, NID, join date.
export function AddMemberFields({ register, errors, readOnly }: AddMemberFieldsProps) {
  const t = useTranslations("AddMember");
  const optional = t("optional");
  const today = todayDateString();
  const errorId = (name: keyof CreateMemberInput) => (errors[name] ? `${name}-error` : undefined);
  const inputProps = (name: keyof CreateMemberInput) => ({
    id: name,
    readOnly,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errorId(name),
    className: "min-h-11",
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
        <Input {...inputProps("nameEn")} autoComplete="off" placeholder={t("placeholders.nameEn")} {...register("nameEn")} />
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
        <Select
          id="guardianRelation"
          disabled={readOnly}
          error={!!errors.guardianRelation}
          className="min-h-11"
          {...register("guardianRelation")}
        >
          <option value="">{t("relation.none")}</option>
          <option value="father">{t("relation.father")}</option>
          <option value="spouse">{t("relation.spouse")}</option>
        </Select>
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
    </div>
  );
}
