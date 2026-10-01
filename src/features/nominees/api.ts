import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { CreateNomineePayload, Nominee, UpdateNomineePayload } from "./types";

const memberPath = (memberNo: string) => encodeURIComponent(memberNo);

// Plain async functions. No React, no cache logic.
export const nomineeApi = {
  // GET /nominee/member/:memberNo (admin) -> data: Nominee[] (main nominee first)
  listByMember: async (memberNo: string): Promise<Nominee[]> => {
    const { data } = await httpKit.get<ApiEnvelope<Nominee[]>>(`/nominee/member/${memberPath(memberNo)}`);
    return data.data;
  },

  // GET /nominee/my-nominees (member role): the logged-in member's nominees
  mine: async (): Promise<Nominee[]> => {
    const { data } = await httpKit.get<ApiEnvelope<Nominee[]>>("/nominee/my-nominees");
    return data.data;
  },

  // POST /nominee/create/:memberNo -> data: the new Nominee. At most 2 per member.
  create: async (memberNo: string, payload: CreateNomineePayload): Promise<Nominee> => {
    const { data } = await httpKit.post<ApiEnvelope<Nominee>>(`/nominee/create/${memberPath(memberNo)}`, payload);
    return data.data;
  },

  // PATCH /nominee/update/:id -> data: the updated Nominee
  update: async (id: string, payload: UpdateNomineePayload): Promise<Nominee> => {
    const { data } = await httpKit.patch<ApiEnvelope<Nominee>>(`/nominee/update/${encodeURIComponent(id)}`, payload);
    return data.data;
  },

  // DELETE /nominee/delete/:id -> data: null. The last nominee can't be deleted.
  remove: async (id: string): Promise<void> => {
    await httpKit.delete<ApiEnvelope<null>>(`/nominee/delete/${encodeURIComponent(id)}`);
  },
};
