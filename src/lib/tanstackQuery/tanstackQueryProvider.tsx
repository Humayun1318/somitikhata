"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "./makeQueryClient";

interface Props {
  children: ReactNode;
}

// Server: a new client every time, so requests never share a cache.
// Browser: one client for the whole session.
let browserQueryClient: QueryClient | undefined;

function getClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export default function TanstackQueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={getClient()}>{children}</QueryClientProvider>
  );
}