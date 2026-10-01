// Login accounts (backend user module). Admin management and the member's
// login account both use these.

// Same values as AccountStatus in the backend (user.interface.ts).
// Only "active" can log in; the backend checks it on every request.
export const ACCOUNT_STATUSES = ["active", "inactive", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

// A login account from GET /user (the password is never sent).
export type AccountUser = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  memberNo?: string;
  staffNo?: string;
  role: "super_admin" | "admin" | "member" | (string & {});
  status: AccountStatus;
  mustChangePassword: boolean;
  lastLogin?: string;
};

// What the account dialogs need to know about the account they act on.
export type AccountTarget = {
  /** The user's _id (not the Member _id). */
  id: string;
  name: string;
  /** Shown next to the name: staff ID or member number. */
  identifier?: string;
  status: AccountStatus;
  /** Decides the sign-in hint (staff ID / email vs member number). */
  kind: "admin" | "member";
};
