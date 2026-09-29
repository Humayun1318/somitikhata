import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type {
  CreateMemberPayload,
  Member,
  MemberListParams,
  PaginatedResult,
} from "./types";

// The backend runs `search` as a regular expression. Escape it so a user
// typing "(" or "+" searches for that text instead of breaking the query.
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only params the backend QueryBuilder understands (member.builder.config.ts).
// Empty values are left out so the backend uses its defaults.
function toQueryParams(params: MemberListParams) {
  const search = params.search.trim();

  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search: escapeRegex(search) }),
    ...(params.sort && { sort: params.sort }),
    ...(params.startJoinDate && { startJoinDate: params.startJoinDate }),
    ...(params.endJoinDate && { endJoinDate: params.endJoinDate }),
  };
}

// Plain async functions. No React, no cache logic.
export const memberApi = {
  // GET /member -> data: { meta, data: Member[] }
  list: async (params: MemberListParams): Promise<PaginatedResult<Member>> => {
    const { data } = await httpKit.get<ApiEnvelope<PaginatedResult<Member>>>("/member", {
      params: toQueryParams(params),
    });
    return data.data;
  },

  // POST /member/create -> data: the new Member (with its generated memberNo)
  create: async (payload: CreateMemberPayload): Promise<Member> => {
    const { data } = await httpKit.post<ApiEnvelope<Member>>("/member/create", payload);
    return data.data;
  },
};
