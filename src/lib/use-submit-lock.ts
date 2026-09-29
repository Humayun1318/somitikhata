"use client";

import { useCallback, useRef } from "react";

/**
 * Stops a form from sending the same request twice.
 * `isSubmitting` only updates after a re-render, so a fast double tap or a
 * repeated Enter can start a second request. This ref blocks it right away.
 *
 *   const runLocked = useSubmitLock();
 *   const onSubmit = (values) => runLocked(() => saveThing(values));
 */
export function useSubmitLock() {
  const isRunning = useRef(false);

  return useCallback(async (task: () => Promise<void>) => {
    if (isRunning.current) return;
    isRunning.current = true;
    try {
      await task();
    } finally {
      isRunning.current = false;
    }
  }, []);
}
