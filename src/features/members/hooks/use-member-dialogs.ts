"use client";

import { useState } from "react";

import type { Member } from "../types";

export type MemberDialogType = "form" | "view" | "status";

/**
 * Which member dialog is open, and for which member.
 * - The member is kept after closing, so a dialog doesn't change while it animates out.
 * - `key` changes on every open, so each dialog starts with fresh form state.
 * - The kept member is a snapshot. The page shows the list's current row with
 *   the same _id when there is one; `replaceMember` updates the snapshot after
 *   a save, for when the row has left the list (e.g. a status filter).
 */
export function useMemberDialogs() {
  const [openDialog, setOpenDialog] = useState<MemberDialogType | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [key, setKey] = useState(0);

  const open = (type: MemberDialogType, target: Member | null = null) => {
    setMember(target);
    setKey((current) => current + 1);
    setOpenDialog(type);
  };
  const close = () => setOpenDialog(null);
  const replaceMember = (saved: Member) =>
    setMember((current) => (current?._id === saved._id ? { ...current, ...saved } : current));

  return { openDialog, member, key, open, close, replaceMember };
}
