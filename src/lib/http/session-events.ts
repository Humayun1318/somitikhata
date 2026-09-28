// http layer is plain axios, it can't use React hooks or the router.
// The app registers one handler at startup (SessionExpiredListener),
// and the refresh interceptor calls it when the refresh itself fails.
type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(
  handler: SessionExpiredHandler,
): () => void {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}
