import { useMemo } from "react"

import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

export function useScheduleQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => ({
    activeEmployerId: state.activeEmployerId,
    availability: state.availability,
    employers: state.employers,
    requests: state.requests,
    shifts: state.shifts,
  }))
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
