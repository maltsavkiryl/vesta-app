import type { ApiResponse, ApisauceInstance } from "apisauce"

import { tokenStore } from "@/services/auth/tokenStore"

export type Reauthenticate = () => Promise<boolean>

export interface HttpClient {
  get<T>(url: string, params?: object): Promise<ApiResponse<T>>
  post<T>(url: string, body?: object): Promise<ApiResponse<T>>
  put<T>(url: string, body?: object): Promise<ApiResponse<T>>
  delete<T>(url: string, params?: object): Promise<ApiResponse<T>>
}

export function createHttpClient(
  api: Pick<ApisauceInstance, "get" | "post" | "put" | "delete">,
  reauthenticate: Reauthenticate,
): HttpClient {
  function authHeaders(): Record<string, string> {
    const token = tokenStore.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  async function withRetry<T>(send: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    const first = await send()
    if (first.status !== 401) return first
    const refreshed = await reauthenticate()
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
