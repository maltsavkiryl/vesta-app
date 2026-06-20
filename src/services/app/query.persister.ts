/**
 * Synchronous MMKV-backed persister for @tanstack/react-query-persist-client.
 *
 * MMKV is synchronous so we don't need the async-storage variant. We wrap the
 * sync calls in Promise.resolve() to match the Persister interface signature.
 */

import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client"

import { loadString, saveString, remove } from "@/utils/storage"

const PERSISTER_KEY = "rq-cache-v1"

export function createMmkvPersister(): Persister {
  return {
    persistClient: async (persistedClient: PersistedClient) => {
      try {
        saveString(PERSISTER_KEY, JSON.stringify(persistedClient))
      } catch {
        // Storage errors are non-fatal; the app continues without cached data.
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const raw = loadString(PERSISTER_KEY)
        if (!raw) return undefined
        return JSON.parse(raw) as PersistedClient
      } catch {
        return undefined
      }
    },
    removeClient: async () => {
      try {
        remove(PERSISTER_KEY)
      } catch {}
    },
  }
}
