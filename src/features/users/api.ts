import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope, PaginatedResult } from "@/types/api";

import type { AccountStatus, AccountUser } from "./types";

// Account actions on another user. The backend allows: an admin -> members only;
// the super admin -> members and admins; nobody -> their own account.
export const userAccountApi = {
  // GET /user?member=<Member _id>&role=member: the login account of one member.
  // `member` is a filterable ObjectId field (user.builder.config.ts).
  findByMember: async (memberId: string): Promise<AccountUser | null> => {
    const { data } = await httpKit.get<ApiEnvelope<PaginatedResult<AccountUser>>>("/user", {
      params: { member: memberId, role: "member", limit: 1 },
    });
    return data.data.data[0] ?? null;
  },

  // PATCH /user/update-status/:id { status } -> data: the updated user
  updateStatus: async (id: string, status: AccountStatus): Promise<AccountUser> => {
    const { data } = await httpKit.patch<ApiEnvelope<AccountUser>>(`/user/update-status/${encodeURIComponent(id)}`, {
      status,
    });
    return data.data;
  },

  // PATCH /user/reset-password/:id (no body) -> data: null.
  // The password becomes the phone number on the account, the user must change
  // it after signing in, older sessions stop working and a login lock is cleared.
  resetPassword: async (id: string): Promise<void> => {
    await httpKit.patch<ApiEnvelope<null>>(`/user/reset-password/${encodeURIComponent(id)}`);
  },
};
