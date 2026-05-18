import { useMemo } from "react"

import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

export function useProfileQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => state.profile)
}

export function useEmployersQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => ({
    activeEmployerId: state.activeEmployerId,
    employerDirectory: state.employerDirectory,
    employers: state.employers,
  }))
}

export function useSelectedEmployerQuery() {
  const { accountId } = useAuthSession()
  const query = useCurrentAppStateQuery(accountId, (state) => ({
    activeEmployerId: state.activeEmployerId,
    employers: state.employers,
  }))

  return useMemo(
    () => query.data?.employers.find((employer) => employer.id === query.data?.activeEmployerId),
    [query.data],
  )
}

export function useProfileStateQuery() {
  const profileQuery = useProfileQuery()
  const employersQuery = useEmployersQuery()
  const selectedEmployer = useSelectedEmployerQuery()

  return useMemo(
    () => ({
      profile: profileQuery.data,
      selectedEmployer,
      state:
        profileQuery.data && employersQuery.data
          ? {
              activeEmployerId: employersQuery.data.activeEmployerId,
              employerDirectory: employersQuery.data.employerDirectory,
              employers: employersQuery.data.employers,
              profile: profileQuery.data,
            }
          : undefined,
    }),
    [employersQuery.data, profileQuery.data, selectedEmployer],
  )
}
