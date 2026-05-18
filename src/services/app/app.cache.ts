import type { QueryClient } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"

import { appQueryKeys } from "./app.queries"
import type { MockBackendSessionDto } from "./app.types"

export function setSessionCache(queryClient: QueryClient, session: MockBackendSessionDto) {
  queryClient.setQueryData(appQueryKeys.session, session)
}

export function setAccountStateCache(
  queryClient: QueryClient,
  accountId: string,
  state: AppStoreState,
) {
  queryClient.setQueryData(appQueryKeys.appState(accountId), state)
}
