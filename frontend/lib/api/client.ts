// lib/api/client.ts
// Typed fetch wrapper for the backend in backend/. Every call attaches the stored access
// token and, on a 401, tries one silent refresh (via POST /auth/refresh) before retrying
// the original request once. Auth endpoints themselves (`skipAuth`) never go through that
// retry — a bad login/signup/refresh is a real 401, not an expired session.

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const ACCESS_TOKEN_KEY = 'trustlink.accessToken';
const REFRESH_TOKEN_KEY = 'trustlink.refreshToken';

// expo-secure-store has no web backing (its web module is an empty stub), so calling it on
// web throws. Falling back to an in-memory map keeps the "never localStorage/sessionStorage"
// rule true there too — the session just doesn't survive a page refresh on web.
const memoryStore = new Map<string, string>();
const hasSecureStore = Platform.OS !== 'web';

async function getStoredItem(key: string): Promise<string | null> {
  if (hasSecureStore) return SecureStore.getItemAsync(key);
  return memoryStore.get(key) ?? null;
}

async function setStoredItem(key: string, value: string): Promise<void> {
  if (hasSecureStore) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  memoryStore.set(key, value);
}

async function deleteStoredItem(key: string): Promise<void> {
  if (hasSecureStore) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  memoryStore.delete(key);
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function storeTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    setStoredItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    setStoredItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteStoredItem(ACCESS_TOKEN_KEY), deleteStoredItem(REFRESH_TOKEN_KEY)]);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skips attaching an access token and skips the 401-refresh retry — for /auth/* itself. */
  skipAuth?: boolean;
}

async function rawRequest<T>(path: string, options: ApiRequestOptions, accessToken: string | null): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data && typeof data.error === 'string' ? data.error : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

// Concurrent 401s share one refresh call instead of each firing their own.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await getStoredItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new ApiError(401, 'No refresh token available');

      const data = await rawRequest<{ accessToken: string; expiresIn: number }>(
        '/auth/refresh',
        { method: 'POST', body: { refreshToken }, skipAuth: true },
        null,
      );
      await setStoredItem(ACCESS_TOKEN_KEY, data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const accessToken = options.skipAuth ? null : await getStoredItem(ACCESS_TOKEN_KEY);

  try {
    return await rawRequest<T>(path, options, accessToken);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401 || options.skipAuth) {
      throw err;
    }

    try {
      const newAccessToken = await refreshAccessToken();
      return await rawRequest<T>(path, options, newAccessToken);
    } catch {
      await clearTokens();
      throw err;
    }
  }
}
