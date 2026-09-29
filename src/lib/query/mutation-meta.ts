import "@tanstack/react-query";

// Typed `meta` for every useMutation in the app.
// Read by MutationLoadingToasts (components/shared/toast).
export type AppMutationMeta = {
  /** Key under "ApiLoading" in messages/<locale>/common.json. Default: "default". */
  loadingMessage?: string;
};

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: AppMutationMeta;
  }
}
