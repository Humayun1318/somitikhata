// The backend's shared address shape (shared/address on the server).
// Used for a member's present/permanent address and a nominee's address.
// Every part is optional; a member's present address needs upazila + district.
export const ADDRESS_PARTS = ["village", "postOffice", "union", "upazila", "district"] as const;
export type AddressPart = (typeof ADDRESS_PARTS)[number];
export type Address = Partial<Record<AddressPart, string>>;
