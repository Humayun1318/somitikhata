import { ApiError } from '@/lib/api-errors';
import { getPublicEnv } from '@/lib/env';

type ApiClientOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

function getRequestUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const baseUrl = getPublicEnv().NEXT_PUBLIC_API_BASE_URL;
  return baseUrl ? new URL(path, baseUrl).toString() : path;
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<unknown>;
  }

  return response.text();
}

export async function apiClient<T>(
  path: string,
  { method = 'GET', body, headers, ...options }: ApiClientOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(getRequestUrl(path), {
    ...options,
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: requestHeaders,
    cache: method === 'GET' ? 'no-store' : 'no-store',
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const errorPayload =
      typeof payload === 'object' && payload !== null
        ? (payload as { error?: { code?: string; message?: string; details?: unknown } })
        : undefined;

    throw new ApiError({
      code: errorPayload?.error?.code,
      details: errorPayload?.error?.details,
      message: errorPayload?.error?.message ?? `Request failed with status ${response.status}.`,
      status: response.status,
    });
  }

  return payload as T;
}
