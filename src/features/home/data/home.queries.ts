import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const homeQueryKeys = {
  overview: (accountId: string | null) => ["home", accountId, "overview"] as const,
}

export function useHomeQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.home.getHomeOverview(accountId!),
    queryKey: homeQueryKeys.overview(accountId),
  })

  return useMemo(() => query.data, [query.data])
}
