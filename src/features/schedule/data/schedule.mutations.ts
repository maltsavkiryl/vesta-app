import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AvailabilityDay } from "@/core/models"
import { useAppSession } from "@/providers/app-provider"

import { scheduleQueryKeys } from "./schedule.queries"
import { createRequestWorkflow } from "./schedule.workflow"

function invalidateScheduleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
) {
  void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.overview(accountId) })
  void queryClient.invalidateQueries({ queryKey: ["home", accountId] })
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: AvailabilityDay) =>
      appRepositories.schedule.saveAvailability(accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateScheduleQueries(queryClient, accountId)
    },
  })
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof createRequestWorkflow>[2]) =>
      createRequestWorkflow(appRepositories.schedule, accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateScheduleQueries(queryClient, accountId)
    },
  })
}

export function useScheduleActions() {
  const updateAvailabilityMutation = useUpdateAvailabilityMutation()
  const createRequestMutation = useCreateRequestMutation()

  return useMemo(
    () => ({
      createRequest: (payload: Parameters<typeof createRequestWorkflow>[2]) =>
        createRequestMutation.mutateAsync(payload),
      updateAvailability: (payload: AvailabilityDay) =>
        updateAvailabilityMutation.mutateAsync(payload),
    }),
    [createRequestMutation, updateAvailabilityMutation],
  )
}
