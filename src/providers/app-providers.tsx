"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/shared/toast/toast-provider";
import { SessionExpiredListener } from "@/features/auth/components/session-expired-listener";
import QueryProvider from "@/lib/query/query-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <SessionExpiredListener />
        {children}
      </ToastProvider>
    </QueryProvider>
  );
}
