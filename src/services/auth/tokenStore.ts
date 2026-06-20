import * as SecureStore from "expo-secure-store"

const KEY = "vesta-mobile.backend-token"

export interface BackendToken {
  accessToken: string
  expiresAt: number // epoch ms
  accountId: string
  profileComplete: boolean
}

let cache: BackendToken | null = null

export const tokenStore = {
  async load(): Promise<BackendToken | null> {
    const raw = await SecureStore.getItemAsync(KEY)
    cache = raw ? (JSON.parse(raw) as BackendToken) : null
    return cache
  },
  async set(token: BackendToken): Promise<void> {
    cache = token
    await SecureStore.setItemAsync(KEY, JSON.stringify(token))
  },
  getAccessToken(): string | null {
    return cache?.accessToken ?? null
  },
  getAccountId(): string | null {
    return cache?.accountId ?? null
  },
  getProfileComplete(): boolean {
    return cache?.profileComplete ?? false
  },
  isExpired(nowMs: number): boolean {
    return !cache || cache.expiresAt <= nowMs
  },
  async clear(): Promise<void> {
    cache = null
    await SecureStore.deleteItemAsync(KEY)
  },
}
