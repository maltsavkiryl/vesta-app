import type { QueryClient } from "@tanstack/react-query"

import type { AppSession } from "@/services/app/app.session"

import { appQueryKeys } from "./app.queries"

export function setSessionCache(queryClient: QueryClient, session: AppSession) {
  queryClient.setQueryData(appQueryKeys.session, session)
}
