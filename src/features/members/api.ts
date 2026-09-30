import { dhakaDayEnd, dhakaDayStart } from "@/lib/dhaka-date";
import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type {
  CreateMemberPayload,
  Member,
  MemberListParams,
  PaginatedResult,
  UpdateMemberPayload,
  UpdateMemberStatusPayload,
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
    ...(params.status && { status: params.status }),
    ...(params.sort && { sort: params.sort }),
    // Whole Dhaka days, so the first/last day of the range is fully included.
    ...(params.startJoinDate && { startJoinDate: dhakaDayStart(params.startJoinDate) }),
    ...(params.endJoinDate && { endJoinDate: dhakaDayEnd(params.endJoinDate) }),
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

  // GET /member/:memberNo (admin). Accepts "41", "0041" or "LBKS-0041".
  getByMemberNo: async (memberNo: string): Promise<Member> => {
    const { data } = await httpKit.get<ApiEnvelope<Member>>(`/member/${encodeURIComponent(memberNo)}`);
    return data.data;
  },

  // GET /member/me (member role): the logged-in member's own record.
  me: async (): Promise<Member> => {
    const { data } = await httpKit.get<ApiEnvelope<Member>>("/member/me");
    return data.data;
  },

  // PATCH /member/update/:memberNo -> data: the updated Member
  update: async (memberNo: string, payload: UpdateMemberPayload): Promise<Member> => {
    const { data } = await httpKit.patch<ApiEnvelope<Member>>(
      `/member/update/${encodeURIComponent(memberNo)}`,
      payload,
    );
    return data.data;
  },

  // PATCH /member/update-status/:memberNo -> data: the updated Member.
  // The backend also switches the member's login account to match.
  updateStatus: async (memberNo: string, payload: UpdateMemberStatusPayload): Promise<Member> => {
    const { data } = await httpKit.patch<ApiEnvelope<Member>>(
      `/member/update-status/${encodeURIComponent(memberNo)}`,
      payload,
    );
    return data.data;
  },
};
