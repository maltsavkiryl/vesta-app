import { QueryClient, useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AppSession } from "@/services/app/app.session"

import { getSession } from "./app.store"

export const appQueryKeys = {
  session: ["auth", "session"] as const,
  profile: (accountId: string | null) => ["profile", accountId, "detail"] as const,
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 h — persistence maxAge match
        staleTime: 1000 * 30,
        retry: (failureCount, error) => {
          // Don't retry on auth errors; retry up to 3x with increasing delay
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status
            if (status === 401 || status === 403) return false
          }
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
        refetchOnReconnect: true,
      },
    },
  })
}

export function useAppSessionQuery() {
  return useQuery<AppSession>({
    initialData: () => {
      const session = getSession()
      if (!session.accountId) {
        return {
          accountId: null,
          isSignedIn: false,
          needsOnboarding: false,
          signedInAt: session.signedInAt,
        }
      }

      return undefined
    },
    queryFn: () => appRepositories.auth.getSession(),
    queryKey: appQueryKeys.session,
  })
}
