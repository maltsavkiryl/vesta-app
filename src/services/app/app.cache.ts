import type { QueryClient } from "@tanstack/react-query"

import type { AppSession } from "@/features/auth/data/auth.transformer"

import { appQueryKeys } from "./app.queries"

export function setSessionCache(queryClient: QueryClient, session: AppSession) {
  queryClient.setQueryData(appQueryKeys.session, session)
}
