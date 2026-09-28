"use client";

import { SessionExpiredListener } from "@/app/[locale]/(auth)/_components/session-expired-listener";
import TanstackQueryProvider from "@/lib/tanstackQuery/tanstackQueryProvider";


interface ProviderProps {
  children: Readonly<React.ReactNode>;
}

export default function Provider({ children }: ProviderProps) {
  return (
    <TanstackQueryProvider>
      <SessionExpiredListener />
      {children}
    </TanstackQueryProvider>
  );
}
