import type { ApiResponse, ApisauceInstance } from "apisauce"

import { tokenStore } from "@/services/auth/tokenStore"

export type Reauthenticate = () => Promise<boolean>

export interface HttpClient {
  get<T>(url: string, params?: object): Promise<ApiResponse<T>>
  post<T>(url: string, body?: object): Promise<ApiResponse<T>>
  put<T>(url: string, body?: object): Promise<ApiResponse<T>>
  delete<T>(url: string, params?: object): Promise<ApiResponse<T>>
}

// Refresh a still-valid token this long before it expires, so requests don't
// have to fail with a 401 first.
const REFRESH_LEAD_MS = 60_000

export function createHttpClient(
  api: Pick<ApisauceInstance, "get" | "post" | "put" | "delete">,
  reauthenticate: Reauthenticate,
): HttpClient {
  // Coalesce concurrent refreshes: a burst of requests triggers exactly one
  // reauthenticate, and they all await its result.
  let inFlightRefresh: Promise<boolean> | null = null
  function refreshOnce(): Promise<boolean> {
    inFlightRefresh ??= reauthenticate().finally(() => {
      inFlightRefresh = null
    })
    return inFlightRefresh
  }
  function authHeaders(): Record<string, string> {
    const token = tokenStore.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  // Proactively refresh a held token that is about to expire. Unauthenticated
  // calls (login, etc.) hold no token and are left untouched.
  async function ensureFreshToken(): Promise<void> {
    if (tokenStore.getAccessToken() && tokenStore.expiresWithin(Date.now(), REFRESH_LEAD_MS)) {
      await refreshOnce()
    }
  }
  async function withRetry<T>(send: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    await ensureFreshToken()
    const first = await send()
    if (first.status !== 401) return first
    const refreshed = await refreshOnce()
    if (!refreshed) return first
    return send()
  }
  return {
    get: (url, params) => withRetry(() => api.get(url, params, { headers: authHeaders() })),
    post: (url, body) => withRetry(() => api.post(url, body, { headers: authHeaders() })),
    put: (url, body) => withRetry(() => api.put(url, body, { headers: authHeaders() })),
    delete: (url, params) => withRetry(() => api.delete(url, params, { headers: authHeaders() })),
  }
}
