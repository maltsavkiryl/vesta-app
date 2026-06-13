import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AvailabilityOverride, AvailabilityTemplate } from "@/core/models"
import { useAppSession } from "@/providers/app-provider"
import { failure, success } from "@/shared/result"

import { scheduleQueryKeys } from "./schedule.queries"
import { declineShift as declineShiftService } from "./schedule.service"
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

export function useDeclineShiftMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    // Bypasses the injected repository on purpose: decline is owned by the
    // schedule data layer (the shared reducer only knows "acknowledge").
    mutationFn: (shiftId: string) => {
      const nextState = declineShiftService(accountId!, shiftId)
      const shift = nextState.shifts.find((candidate) => candidate.id === shiftId)
      return Promise.resolve(
        shift
          ? success(shift)
          : failure({ type: "not-found" as const, message: "Shift not found." }),
      )
    },
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
  const declineShiftMutation = useDeclineShiftMutation()

  return useMemo(
    () => ({
      createRequest: (payload: Parameters<typeof createRequestWorkflow>[2]) =>
        createRequestMutation.mutateAsync(payload),
      declineShift: (shiftId: string) => declineShiftMutation.mutateAsync(shiftId),
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
      declineShiftMutation,
      respondToShiftMutation,
      saveAvailabilityOverrideMutation,
      saveAvailabilityTemplateMutation,
      submitPlanningWindowMutation,
    ],
  )
}
