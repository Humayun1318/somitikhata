// All settings queries live under ["settings"], so one invalidation after a
// change refreshes the list and every single-key read (e.g. the 95% hint).
export const settingKeys = {
  all: ["settings"] as const,
  list: () => [...settingKeys.all, "list"] as const,
  one: (key: string) => [...settingKeys.all, "one", key] as const,
};
