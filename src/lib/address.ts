import { z } from "zod";

import { ADDRESS_PARTS, type Address } from "@/types/address";

type Translate = (key: string) => string;

// Same limits as addressZodSchema on the backend (50 characters per part).
// required: upazila and district must be filled (a member's present address).
export function addressSchema(t: Translate, required = false) {
  const part = z.string().trim().max(50, t("validation.tooLong"));
  const requiredPart = (key: string) =>
    z
      .string()
      .trim()
      .min(1, t(`validation.${key}Required`))
      .max(50, t("validation.tooLong"));

  return z.object({
    village: part,
    postOffice: part,
    union: part,
    upazila: required ? requiredPart("upazila") : part,
    district: required ? requiredPart("district") : part,
  });
}

export type AddressInput = z.infer<ReturnType<typeof addressSchema>>;

export function toAddressFormValues(address?: Address): AddressInput {
  return {
    village: address?.village ?? "",
    postOffice: address?.postOffice ?? "",
    union: address?.union ?? "",
    upazila: address?.upazila ?? "",
    district: address?.district ?? "",
  };
}

// The backend schema is strict and an empty part fails "cannot be empty",
// so only filled parts are sent. Nothing filled = undefined.
export function toAddressPayload(values: AddressInput): Address | undefined {
  const entries = ADDRESS_PARTS.map((part) => [part, values[part].trim()] as const).filter(([, value]) => value);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

// "Chunati, Lohagara, Chattogram" (small to big). Empty = "".
export function formatAddress(address?: Address) {
  if (!address) return "";
  return ADDRESS_PARTS.map((part) => address[part]?.trim())
    .filter(Boolean)
    .join(", ");
}
