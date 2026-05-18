import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState, UserProfile } from "@/core/models"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { setAccountStateCache } from "@/services/app/app.cache"

import { joinEmployer, switchEmployer, updateProfile } from "./profile.service"

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, Partial<UserProfile>>({
    mutationFn: (payload: Parameters<typeof updateProfile>[1]) =>
      Promise.resolve(updateProfile(accountId!, payload)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useJoinEmployerMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, string>({
    mutationFn: (employerId: string) => Promise.resolve(joinEmployer(accountId!, employerId)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useSwitchEmployerMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, string>({
    mutationFn: (employerId: string) => Promise.resolve(switchEmployer(accountId!, employerId)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useProfileActions() {
  const updateProfileMutation = useUpdateProfileMutation()
  const joinEmployerMutation = useJoinEmployerMutation()
  const switchEmployerMutation = useSwitchEmployerMutation()

  return useMemo(
    () => ({
      joinEmployer: (employerId: string) => joinEmployerMutation.mutate(employerId),
      switchEmployer: (employerId: string) => switchEmployerMutation.mutate(employerId),
      updateProfile: (payload: Parameters<typeof updateProfile>[1]) =>
        updateProfileMutation.mutate(payload),
    }),
    [joinEmployerMutation, switchEmployerMutation, updateProfileMutation],
  )
}
