import { QueryClient, useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AppSession } from "@/features/auth/data/auth.transformer"

import { getSession } from "./app.store"

export const appQueryKeys = {
  session: ["auth", "session"] as const,
  profile: (accountId: string | null) => ["profile", accountId, "detail"] as const,
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60,
        staleTime: 1000 * 30,
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
