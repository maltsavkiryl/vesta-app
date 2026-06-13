import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const scheduleQueryKeys = {
  overview: (accountId: string | null) => ["schedule", accountId, "overview"] as const,
}

export function useScheduleQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.schedule.getSchedule(accountId!),
    queryKey: scheduleQueryKeys.overview(accountId),
  })
}

export function useScheduleStateQuery() {
  const query = useScheduleQuery()

  // Surface loading/error/refetch alongside data so screens can render
  // skeletons, an error + retry state, and pull-to-refresh instead of silently
  // falling back to fabricated defaults while the fetch is in flight.
  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}
