import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AvailabilityOverride, AvailabilityTemplate } from "@/core/models"
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

export function useSaveAvailabilityOverrideMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: AvailabilityOverride) =>
      appRepositories.schedule.saveAvailabilityOverride(accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateScheduleQueries(queryClient, accountId)
    },
  })
}

export function useSaveAvailabilityTemplateMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: AvailabilityTemplate) =>
      appRepositories.schedule.saveAvailabilityTemplate(accountId!, payload),
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

export function useSubmitPlanningWindowMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (planningWindowId: string) =>
      appRepositories.schedule.submitPlanningWindow(accountId!, planningWindowId),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateScheduleQueries(queryClient, accountId)
    },
  })
}

export function useRespondToShiftMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (shiftId: string) => appRepositories.schedule.respondToShift(accountId!, shiftId),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateScheduleQueries(queryClient, accountId)
    },
  })
}

export function useScheduleActions() {
  const saveAvailabilityOverrideMutation = useSaveAvailabilityOverrideMutation()
  const saveAvailabilityTemplateMutation = useSaveAvailabilityTemplateMutation()
  const createRequestMutation = useCreateRequestMutation()
  const submitPlanningWindowMutation = useSubmitPlanningWindowMutation()
  const respondToShiftMutation = useRespondToShiftMutation()

  return useMemo(
    () => ({
      createRequest: (payload: Parameters<typeof createRequestWorkflow>[2]) =>
        createRequestMutation.mutateAsync(payload),
      respondToShift: (shiftId: string) => respondToShiftMutation.mutateAsync(shiftId),
      saveAvailabilityOverride: (payload: AvailabilityOverride) =>
        saveAvailabilityOverrideMutation.mutateAsync(payload),
      saveAvailabilityTemplate: (payload: AvailabilityTemplate) =>
        saveAvailabilityTemplateMutation.mutateAsync(payload),
      submitPlanningWindow: (planningWindowId: string) =>
        submitPlanningWindowMutation.mutateAsync(planningWindowId),
    }),
    [
      createRequestMutation,
      respondToShiftMutation,
      saveAvailabilityOverrideMutation,
      saveAvailabilityTemplateMutation,
      submitPlanningWindowMutation,
    ],
  )
}
