import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

import { timeQueryKeys } from "./time.queries"
import { clockInWorkflow, clockOutWorkflow } from "./time.workflow"

function invalidateTimeQueries(queryClient: ReturnType<typeof useQueryClient>, accountId: string) {
  void queryClient.invalidateQueries({ queryKey: timeQueryKeys.overview(accountId) })
  void queryClient.invalidateQueries({ queryKey: ["home", accountId] })
}

export function useStartClockMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof clockInWorkflow>[2]) =>
      clockInWorkflow(appRepositories.time, accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateTimeQueries(queryClient, accountId)
    },
  })
}

export function useStartBreakMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof appRepositories.time.startBreak>[1]) =>
      appRepositories.time.startBreak(accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateTimeQueries(queryClient, accountId)
    },
  })
}

export function useEndBreakMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof appRepositories.time.endBreak>[1]) =>
      appRepositories.time.endBreak(accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateTimeQueries(queryClient, accountId)
    },
  })
}

export function useConfirmClockOutMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof clockOutWorkflow>[2]) =>
      clockOutWorkflow(appRepositories.time, accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateTimeQueries(queryClient, accountId)
    },
  })
}

export function useTimeActions() {
  const startClockMutation = useStartClockMutation()
  const startBreakMutation = useStartBreakMutation()
  const endBreakMutation = useEndBreakMutation()
  const confirmClockOutMutation = useConfirmClockOutMutation()

  return useMemo(
    () => ({
      confirmClockOut: (payload?: Parameters<typeof clockOutWorkflow>[2]) =>
        confirmClockOutMutation.mutateAsync(payload),
      endBreak: (payload?: Parameters<typeof appRepositories.time.endBreak>[1]) =>
        endBreakMutation.mutateAsync(payload),
      startBreak: (payload?: Parameters<typeof appRepositories.time.startBreak>[1]) =>
        startBreakMutation.mutateAsync(payload),
      startClock: (payload?: Parameters<typeof clockInWorkflow>[2]) =>
        startClockMutation.mutateAsync(payload),
    }),
    [confirmClockOutMutation, endBreakMutation, startBreakMutation, startClockMutation],
  )
}
