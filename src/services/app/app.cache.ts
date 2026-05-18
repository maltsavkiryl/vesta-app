import type { QueryClient } from "@tanstack/react-query"

import { appQueryKeys } from "./app.queries"
import type { MockBackendSessionDto } from "./app.types"

export function setSessionCache(queryClient: QueryClient, session: MockBackendSessionDto) {
  queryClient.setQueryData(appQueryKeys.session, session)
}
