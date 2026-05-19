import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { UserProfile } from "@/core/models"
import { profileQueryKeys } from "@/features/profile/data/profile.queries"
import { useAppSession } from "@/providers/app-provider"

function invalidateProfileQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
  includeHome = false,
) {
  void queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile(accountId) })
  void queryClient.invalidateQueries({ queryKey: profileQueryKeys.employers(accountId) })
  if (includeHome) {
    void queryClient.invalidateQueries({ queryKey: ["home", accountId] })
    void queryClient.invalidateQueries({ queryKey: ["schedule", accountId] })
  }
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Partial<UserProfile>) =>
      appRepositories.profile.updateProfile(accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateProfileQueries(queryClient, accountId, true)
    },
  })
}

export function useJoinEmployerMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (employerId: string) =>
      appRepositories.profile.joinEmployer(accountId!, employerId),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateProfileQueries(queryClient, accountId, true)
    },
  })
}

export function useProfileActions() {
  const updateProfileMutation = useUpdateProfileMutation()
  const joinEmployerMutation = useJoinEmployerMutation()

  return useMemo(
    () => ({
      joinEmployer: (employerId: string) => joinEmployerMutation.mutateAsync(employerId),
      updateProfile: (payload: Partial<UserProfile>) => updateProfileMutation.mutateAsync(payload),
    }),
    [joinEmployerMutation, updateProfileMutation],
  )
}
