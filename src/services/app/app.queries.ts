import { QueryClient, useQuery } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"

import { getAccountState, getSession } from "./app.store"

export const appQueryKeys = {
  appState: (accountId: string | null) => ["app-state", accountId] as const,
  session: ["app-session"] as const,
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
  return useQuery({
    initialData: () => getSession(),
    queryFn: () => getSession(),
    queryKey: appQueryKeys.session,
  })
}

export function useCurrentAppStateQuery<T = AppStoreState>(
  accountId: string | null,
  select?: (state: AppStoreState) => T,
) {
  return useQuery({
    enabled: Boolean(accountId),
    initialData: accountId ? () => getAccountState(accountId) : undefined,
    queryFn: () => getAccountState(accountId!),
    queryKey: appQueryKeys.appState(accountId),
    select,
  })
}
