import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { AdminListParams, CreateAdminPayload, PaginatedResult, StaffUser } from "./types";

// The backend runs `search` as a regular expression; search literal text.
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const adminApi = {
  // GET /user with role=admin. role and status are filterable enum fields in
  // user.builder.config.ts; search covers name, email, phone, memberNo and staffNo.
  list: async (params: AdminListParams): Promise<PaginatedResult<StaffUser>> => {
    const search = params.search.trim();
    const { data } = await httpKit.get<ApiEnvelope<PaginatedResult<StaffUser>>>("/user", {
      params: {
        role: "admin",
        page: params.page,
        limit: params.limit,
        ...(search && { search: escapeRegex(search) }),
        ...(params.status && { status: params.status }),
        ...(params.sort && { sort: params.sort }),
      },
    });
    return data.data;
  },

  // POST /user/create-admin (super admin only) -> data: the new admin (with staffNo)
  create: async (payload: CreateAdminPayload): Promise<StaffUser> => {
    const { data } = await httpKit.post<ApiEnvelope<StaffUser>>("/user/create-admin", payload);
    return data.data;
  },
};
