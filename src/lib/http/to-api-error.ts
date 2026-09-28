import type { AxiosError } from 'axios';

import { ApiError } from '@/lib/api-errors';

export function toApiError(error: AxiosError): ApiError {
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
