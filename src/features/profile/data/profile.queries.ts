import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const profileQueryKeys = {
  employers: (accountId: string | null) => ["profile", accountId, "employers"] as const,
  profile: (accountId: string | null) => ["profile", accountId, "detail"] as const,
}

export function useProfileQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.profile.getProfile(accountId!),
    queryKey: profileQueryKeys.profile(accountId),
  })
}

export function useEmployersQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.profile.getEmployers(accountId!),
    queryKey: profileQueryKeys.employers(accountId),
  })
}

export function useSelectedEmployerQuery() {
  const employersQuery = useEmployersQuery()

  return useMemo(
    () =>
      employersQuery.data?.employers.find(
        (employer) => employer.id === employersQuery.data?.activeEmployerId,
      ),
    [employersQuery.data],
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
