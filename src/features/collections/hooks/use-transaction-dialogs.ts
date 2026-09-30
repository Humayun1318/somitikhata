"use client";

import { useState } from "react";

import type { Transaction } from "../types";

export type TransactionDialogType = "record" | "details" | "reverse";

/** Pre-filled values for the record form (e.g. the member open in the passbook). */
export type RecordDefaults = { memberNo?: string; cashAccountId?: string };

/**
 * Which collections dialog is open, and for which transaction.
 * - The transaction is kept after closing, so a dialog doesn't change while it animates out.
 * - `key` changes on every open, so each dialog starts with fresh form state.
 */
export function useTransactionDialogs() {
  const [openDialog, setOpenDialog] = useState<TransactionDialogType | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [recordDefaults, setRecordDefaults] = useState<RecordDefaults>({});
  const [key, setKey] = useState(0);

  const show = (type: TransactionDialogType) => {
    setKey((current) => current + 1);
    setOpenDialog(type);
  };

  const openRecord = (defaults: RecordDefaults = {}) => {
    setRecordDefaults(defaults);
    show("record");
  };
  const openDetails = (target: Transaction) => {
    setTransaction(target);
    show("details");
  };
  const openReverse = () => show("reverse");
  const close = () => setOpenDialog(null);

  return { openDialog, transaction, recordDefaults, key, openRecord, openDetails, openReverse, close };
}
