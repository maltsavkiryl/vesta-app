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

  return useMemo(
    () => ({
      selectedEmployer: query.data?.employers.find(
        (employer) => employer.id === query.data?.activeEmployerId,
      ),
      state: query.data,
    }),
    [query.data],
  )
}
