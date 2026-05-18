import { QueryClient, useQuery } from "@tanstack/react-query"

import { getSession } from "./app.store"

export const appQueryKeys = {
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
