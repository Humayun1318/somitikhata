import axios, { type AxiosInstance } from 'axios';

import { getPublicEnv } from '@/lib/env';

import { attachAuthRefresh } from './auth-refresh';

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
  baseURL: getPublicEnv().NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

attachAuthRefresh(httpKit);
