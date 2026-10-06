import type { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { ApiError } from '@/lib/api-errors';

import { notifySessionExpired } from './session-events';
import { toApiError } from './to-api-error';

// `_retry`: this request was already retried once after a refresh.
// `_sentAt`: when it was sent, to know if a refresh finished after that.
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean; _sentAt?: number };

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh-token', '/auth/logout'];

function isAuthEndpoint(url?: string): boolean {
  return !!url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// The backend answers 400/401/403 when the refresh cookie is missing, expired,
// older than a password change, or the account is blocked: the session is over.
// No answer (status 0) or a 5xx is a network/server problem, not a logout.
function isSessionOver(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

/**
 * 401 -> refresh -> retry, for cookie auth.
 * The backend sets the HttpOnly cookies; we only call the endpoint.
 */
export function attachAuthRefresh(http: AxiosInstance): void {
  // One shared promise: many parallel 401s cause exactly one refresh call.
  let refreshInFlight: Promise<void> | null = null;
  let lastRefreshAt = 0;

  function refreshAccessToken(): Promise<void> {
    if (!refreshInFlight) {
      refreshInFlight = http
        .post('/auth/refresh-token')
        .then(() => {
          lastRefreshAt = Date.now();
        })
        .finally(() => {
          refreshInFlight = null;
        });
    }
    return refreshInFlight;
  }

  http.interceptors.request.use((config: InternalAxiosRequestConfig & { _sentAt?: number }) => {
    config._sentAt = Date.now();
    return config;
  });

  http.interceptors.response.use(
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

      // Sent with the old token, but a refresh has finished since: the cookie
      // is already new, so just send it again (no second refresh call).
      const refreshedSinceSent = (originalRequest._sentAt ?? 0) < lastRefreshAt;

      try {
        if (!refreshedSinceSent) await refreshAccessToken();
      } catch (refreshError) {
        if (isSessionOver(refreshError)) {
          notifySessionExpired();
          return Promise.reject(toApiError(error));
        }
        // Network/server trouble during the refresh: report that (it can be
        // retried) instead of a 401, which would send the user to sign in.
        return Promise.reject(refreshError);
      }

      return http(originalRequest);
    },
  );
}
