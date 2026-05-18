import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { setAccountStateCache } from "@/services/app/app.cache"
import type { ClockActionPayload } from "@/services/app/app.types"

import { confirmClockOut, endBreak, startBreak, startClock } from "./time.service"

function useTimeMutation<TPayload>(
  mutationFn: (accountId: string, payload: TPayload) => Promise<AppStoreState> | AppStoreState,
) {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, TPayload>({
    mutationFn: (payload: TPayload) => Promise.resolve(mutationFn(accountId!, payload)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useStartClockMutation() {
  return useTimeMutation<ClockActionPayload | undefined>(startClock)
}

export function useStartBreakMutation() {
  return useTimeMutation<ClockActionPayload | undefined>(startBreak)
}

export function useEndBreakMutation() {
  return useTimeMutation<ClockActionPayload | undefined>(endBreak)
}

export function useConfirmClockOutMutation() {
  return useTimeMutation<ClockActionPayload | undefined>(confirmClockOut)
}

export function useTimeActions() {
  const startClockMutation = useStartClockMutation()
  const startBreakMutation = useStartBreakMutation()
  const endBreakMutation = useEndBreakMutation()
  const confirmClockOutMutation = useConfirmClockOutMutation()

  return useMemo(
    () => ({
      confirmClockOut: (payload?: ClockActionPayload) => confirmClockOutMutation.mutate(payload),
      endBreak: (payload?: ClockActionPayload) => endBreakMutation.mutate(payload),
      startBreak: (payload?: ClockActionPayload) => startBreakMutation.mutate(payload),
      startClock: (payload?: ClockActionPayload) => startClockMutation.mutate(payload),
    }),
    [confirmClockOutMutation, endBreakMutation, startBreakMutation, startClockMutation],
  )
}
