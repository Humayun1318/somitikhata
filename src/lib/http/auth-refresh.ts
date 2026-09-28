import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { notifySessionExpired } from './session-events';
import { toApiError } from './to-api-error';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh-token', '/auth/logout'];

function isAuthEndpoint(url?: string): boolean {
  return !!url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * 401 -> refresh -> retry, for cookie auth.
 * The backend sets and rotates the HttpOnly cookies; we only call the endpoint.
 */
export function attachAuthRefresh(http: AxiosInstance): void {
  // One shared promise: many parallel 401s cause exactly one refresh call.
  let refreshInFlight: Promise<void> | null = null;

  function refreshAccessToken(): Promise<void> {
    if (!refreshInFlight) {
      refreshInFlight = http
        .post('/auth/refresh-token')
        .then(() => undefined)
        .finally(() => {
          refreshInFlight = null;
        });
    }
    return refreshInFlight;
  }

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

      try {
        await refreshAccessToken();
        return http(originalRequest);
      } catch {
        // Refresh token is missing, expired or rejected: session is over.
        notifySessionExpired();
        return Promise.reject(toApiError(error));
      }
    },
  );
}
