import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState, AvailabilityDay, RequestItem } from "@/core/models"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { setAccountStateCache } from "@/services/app/app.cache"

import { createRequest, updateAvailability } from "./schedule.service"

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, AvailabilityDay>({
    mutationFn: (payload: Parameters<typeof updateAvailability>[1]) =>
      Promise.resolve(updateAvailability(accountId!, payload)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, Omit<RequestItem, "id" | "status">>({
    mutationFn: (payload: Parameters<typeof createRequest>[1]) =>
      Promise.resolve(createRequest(accountId!, payload)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useScheduleActions() {
  const updateAvailabilityMutation = useUpdateAvailabilityMutation()
  const createRequestMutation = useCreateRequestMutation()

  return useMemo(
    () => ({
      createRequest: (payload: Parameters<typeof createRequest>[1]) =>
        createRequestMutation.mutate(payload),
      updateAvailability: (payload: Parameters<typeof updateAvailability>[1]) =>
        updateAvailabilityMutation.mutate(payload),
    }),
    [createRequestMutation, updateAvailabilityMutation],
  )
}
