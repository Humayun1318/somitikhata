import { QueryClient } from "@tanstack/react-query";

// One place for the defaults. Used by getQueryClient (server) and
// TanstackQueryProvider (browser), so both behave the same.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        staleTime: 1000 * 60 * 10, // cache stays fresh for 10 minutes
        gcTime: 1000 * 60 * 30, // cache gets cleaned after 30 minutes
      },
      mutations: {
        retry: false,
      },
    },
  });
}