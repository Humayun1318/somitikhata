"use client";

import type { TransactionTypeCatalog } from "../hooks/use-collection-queries";
import type { useTransactionDialogs } from "../hooks/use-transaction-dialogs";

import { RecordTransactionDialog } from "./record-transaction-dialog";
import { ReverseDialog } from "./reverse-dialog";
import { TransactionDetailsDialog } from "./transaction-details-dialog";

type TransactionDialogsProps = {
  dialogs: ReturnType<typeof useTransactionDialogs>;
  catalog: TransactionTypeCatalog;
};

// The record / details / reverse dialogs, shared by the cash book and the passbook.
export function TransactionDialogs({ dialogs, catalog }: TransactionDialogsProps) {
  const { openDialog, transaction, key, close } = dialogs;

  return (
    <>
      <RecordTransactionDialog
        key={`record-${key}`}
        open={openDialog === "record"}
        onClose={close}
        catalog={catalog}
        defaults={dialogs.recordDefaults}
      />
      {transaction && (
        <TransactionDetailsDialog
          open={openDialog === "details"}
          onClose={close}
          transaction={transaction}
          catalog={catalog}
          onReverse={dialogs.openReverse}
        />
      )}
      {transaction && (
        <ReverseDialog key={`reverse-${key}`} open={openDialog === "reverse"} onClose={close} transaction={transaction} />
      )}
    </>
  );
}
