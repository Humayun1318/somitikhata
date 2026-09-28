import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";


import { getPublicEnv } from "@/lib/env";
import { ApiError } from "../api-errors";

const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();

/**
 * The only axios instance in the app. Every feature api file uses this.
 *
 * Auth is cookie-based: the backend sets HttpOnly accessToken/refreshToken
 * cookies on a different origin. `withCredentials` makes the browser send
 * and store them. The frontend never reads or keeps a token itself.
 *
 * No global Content-Type: axios sets JSON for plain objects and leaves
 * FormData alone, so file uploads work later.
 */
export const httpKit: AxiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// ---- session expired hook ---------------------------------------------------
// This file is plain axios, it can't use React hooks. The app registers one
// handler at startup (SessionExpiredListener), we call it when refresh fails.
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

// ---- 401 -> refresh -> retry ----------------------------------------------
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh-token", "/auth/logout"];

function isAuthEndpoint(url?: string): boolean {
  return !!url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// One shared promise: many parallel 401s cause exactly one refresh call.
let refreshInFlight: Promise<void> | null = null;

function refreshAccessToken(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = httpKit
      .post("/auth/refresh-token")
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

httpKit.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // No refresh when: not a 401, nothing to retry, already retried once
    // (stops loops), or the failing call is an auth endpoint itself.
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(toApiError(error));
    }

    originalRequest._retry = true;

    try {
      await refreshAccessToken();
      return httpKit(originalRequest);
    } catch {
      // Refresh token is missing, expired or rejected: session is over.
      sessionExpiredHandler?.();
      return Promise.reject(toApiError(error));
    }
  },
);

function toApiError(error: AxiosError): ApiError {
  const body = error.response?.data as
    | { message?: string; code?: string }
    | undefined;

  return new ApiError({
    status: error.response?.status ?? 0,
    code: body?.code,
    message: body?.message ?? error.message,
    details: body,
  });
}