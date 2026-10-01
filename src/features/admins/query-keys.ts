import { userKeys } from "@/features/users/query-keys";

import type { AdminListParams } from "./types";

// Under "users", so a status change or password reset refreshes the admin list.
export const adminKeys = {
  all: [...userKeys.all, "admins"] as const,
  lists: () => [...adminKeys.all, "list"] as const,
  list: (params: AdminListParams) => [...adminKeys.lists(), params] as const,
};
