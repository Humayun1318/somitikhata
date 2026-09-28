"use client";

import type { ReactNode } from "react";

import { SessionExpiredListener } from "@/features/auth/components/session-expired-listener";
import QueryProvider from "@/lib/query/query-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionExpiredListener />
      {children}
    </QueryProvider>
  );
}
