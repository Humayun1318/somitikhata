"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useToast } from "./toast-provider";

/**
 * Renders nothing. Shows a loading toast while ANY useMutation is running
 * (login, logout, create, update, delete...) and removes it when it ends.
 * One listener for the whole app, so features never write this themselves.
 *
 * Text: set `meta: { loadingMessage: "createMember" }` on the mutation.
 * The key lives under "ApiLoading" in messages/<locale>/common.json.
 */
export function MutationLoadingToasts() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const t = useTranslations("ApiLoading");

  useEffect(() => {
    // mutationId -> toast id of its loading toast
    const loadingToasts = new Map<number, number>();

    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== "updated" && event.type !== "removed") return;

      const { mutation } = event;
      const id = mutation.mutationId;
      const isPending = event.type === "updated" && mutation.state.status === "pending";

      if (isPending && !loadingToasts.has(id)) {
        const key = mutation.meta?.loadingMessage ?? "default";
        const message = t.has(key) ? t(key) : t("default");
        loadingToasts.set(id, toast.loading(message));
        return;
      }

      const toastId = loadingToasts.get(id);
      if (!isPending && toastId !== undefined) {
        toast.dismiss(toastId);
        loadingToasts.delete(id);
      }
    });

    return () => {
      unsubscribe();
      loadingToasts.forEach((toastId) => toast.dismiss(toastId));
    };
  }, [queryClient, toast, t]);

  return null;
}
