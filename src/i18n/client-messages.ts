// Which messages are sent to the browser.
//
// Server components read every message on the server, so they need nothing here.
// Only Client Components need messages in the browser. The public and sign-in
// pages use a handful of client parts (navbar, account menu, login form, toasts,
// error screen); sending all ~145 KB of messages with every public page would
// only make the HTML heavier. The signed-in area (app/[locale]/(dashboard)/layout.tsx)
// sends everything, because almost all of it is interactive.
//
// Adding a Client Component to a public or sign-in page that reads a new
// namespace? List the namespace (or "Namespace.child") here.
export const PUBLIC_CLIENT_MESSAGES = [
  "Auth",
  "PasswordInput",
  "Error",
  "Errors",
  "Toast",
  "ApiLoading",
  "Footer",
  "DashboardHeader",
  "HomePage.nav",
  "HomePage.hero",
  "HomePage.cta",
] as const;

type Messages = Record<string, unknown>;

/** Copies only the listed namespaces ("A" or "A.b") from `messages`. */
export function pickMessages(messages: Messages, paths: readonly string[]): Messages {
  const result: Messages = {};
  for (const path of paths) {
    const keys = path.split(".");
    let source: unknown = messages;
    for (const key of keys) source = (source as Messages | undefined)?.[key];
    if (source === undefined) continue;

    let target = result;
    keys.slice(0, -1).forEach((key) => {
      target[key] = (target[key] as Messages | undefined) ?? {};
      target = target[key] as Messages;
    });
    target[keys[keys.length - 1]] = source;
  }
  return result;
}
