// One JSON file per feature area in messages/<locale>/.
// Each file holds top-level namespaces (e.g. auth.json -> "Auth").
// New feature: add messages/en/<name>.json and messages/bn/<name>.json, then list <name> here.
const MESSAGE_FILES = ['common', 'home', 'auth', 'dashboard', 'profile', 'members', 'collections', 'admins', 'nominees'] as const;

export async function loadMessages(locale: string) {
  const parts = await Promise.all(
    MESSAGE_FILES.map(async (name) => {
      const mod = await import(`../../messages/${locale}/${name}.json`);
      return mod.default as Record<string, unknown>;
    }),
  );

  return Object.assign({}, ...parts) as Record<string, unknown>;
}
