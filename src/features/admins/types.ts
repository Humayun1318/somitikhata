import type { AccountStatus } from "@/features/users/types";
import type { PaginatedResult } from "@/types/api";

export type { PaginatedResult };
// Account statuses are shared with members' login accounts (features/users).
export { ACCOUNT_STATUSES, type AccountStatus } from "@/features/users/types";

// A staff login account from GET /user (password is never sent).
export type StaffUser = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  staffNo?: string;
  role: "super_admin" | "admin" | "member" | (string & {});
  status: AccountStatus;
  mustChangePassword: boolean;
  lastLogin?: string;
  createdAt?: string;
  // Populated by the list endpoint (name email role); an id elsewhere.
  createdBy?: { _id: string; name: string; email?: string; role?: string } | string | null;
};

// Sortable in user.builder.config.ts.
export type AdminSortField = "name" | "email" | "lastLogin" | "status" | "createdAt";

// What the admins page keeps in the URL. Empty string = not set.
export type AdminListParams = {
  page: number;
  limit: number;
  search: string;
  /** "" = all statuses. */
  status: AccountStatus | "";
  sort: string;
};

// POST /user/create-admin (backend createAdminZodSchema, strict: only these keys).
export type CreateAdminPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
};
