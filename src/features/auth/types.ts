// Widened so an unknown role string still type-checks, autocomplete stays.
export type UserRole = "super_admin" | "admin" | "member" | (string & {});

export type LoginPayload = {
  identifier: string; // memberNo or email
  password: string;
};

export type CurrentUser = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  language: "bn" | "en";
  status: string;
  mustChangePassword: boolean;
  // Identifier shown in the dashboard header: staffNo for admin area users,
  // memberNo for members. Optional so a missing field never breaks the UI.
  memberNo?: string;
  staffNo?: string;
};