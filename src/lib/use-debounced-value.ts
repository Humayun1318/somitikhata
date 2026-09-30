"use client";

import { useEffect, useState } from "react";

// The value, but only after it stopped changing for `delay` ms.
// For lookups while typing, so every keystroke is not a request.
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
