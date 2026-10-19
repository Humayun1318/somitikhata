import { DOCUMENT_KINDS, type DocumentKind } from "@/features/documents/types";
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

// Only params the backend QueryBuilder understands (member.builder.config.ts).
// Empty values are left out so the backend uses its defaults.
function toQueryParams(params: MemberListParams) {
  const search = params.search.trim();

  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search }),
    ...(params.status && { status: params.status }),
    ...(params.sort && { sort: params.sort }),
    // Whole Dhaka days, so the first/last day of the range is fully included.
    ...(params.startJoinDate && { startJoinDate: dhakaDayStart(params.startJoinDate) }),
    ...(params.endJoinDate && { endJoinDate: dhakaDayEnd(params.endJoinDate) }),
  };
}

/** Images sent with the add / edit form, by slot. */
export type MemberFormFiles = Partial<Record<DocumentKind, File>>;

export type MemberUploadOptions = {
  files?: MemberFormFiles;
  /** 0–100 while the request body (the images) goes out. */
  onUploadProgress?: (percent: number) => void;
};

// No images: plain JSON, as before. With images: multipart/form-data, the
// JSON in a "data" field and one file per slot field (backend uploadMemberForm).
// No Content-Type here: the browser sets multipart with its boundary.
function toBody(payload: object, files?: MemberFormFiles) {
  const kinds = DOCUMENT_KINDS.filter((kind) => files?.[kind]);
  if (kinds.length === 0) return payload;

  const body = new FormData();
  body.append("data", JSON.stringify(payload));
  for (const kind of kinds) body.append(kind, files?.[kind] as File);
  return body;
}

const progressConfig = ({ onUploadProgress }: MemberUploadOptions) =>
  onUploadProgress
    ? {
        onUploadProgress: ({ loaded, total }: { loaded: number; total?: number }) => {
          if (total) onUploadProgress(Math.min(100, Math.round((loaded * 100) / total)));
        },
      }
    : {};

// Plain async functions. No React, no cache logic.
export const memberApi = {
  // GET /member -> data: { meta, data: Member[] }
  list: async (params: MemberListParams): Promise<PaginatedResult<Member>> => {
    const { data } = await httpKit.get<ApiEnvelope<PaginatedResult<Member>>>("/member", {
      params: toQueryParams(params),
    });
    return data.data;
  },

  // POST /member/create -> data: the new Member (with its generated memberNo).
  // With images the backend stores them all or none, and deletes them again
  // if the member can't be saved.
  create: async (payload: CreateMemberPayload, options: MemberUploadOptions = {}): Promise<Member> => {
    const { data } = await httpKit.post<ApiEnvelope<Member>>(
      "/member/create",
      toBody(payload, options.files),
      progressConfig(options),
    );
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

  // PATCH /member/update/:memberNo -> data: the updated Member. New images
  // replace their slots, payload.removeDocuments empties slots; the old images
  // are deleted by the backend only after the member is saved.
  update: async (
    memberNo: string,
    payload: UpdateMemberPayload,
    options: MemberUploadOptions = {},
  ): Promise<Member> => {
    const { data } = await httpKit.patch<ApiEnvelope<Member>>(
      `/member/update/${encodeURIComponent(memberNo)}`,
      toBody(payload, options.files),
      progressConfig(options),
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
