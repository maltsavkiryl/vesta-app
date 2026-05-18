import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { setAccountStateCache } from "@/services/app/app.cache"

import { markAllNotificationsRead, markNotificationRead } from "./notifications.service"

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, string>({
    mutationFn: (id: string) => Promise.resolve(markNotificationRead(accountId!, id)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, void>({
    mutationFn: () => Promise.resolve(markAllNotificationsRead(accountId!)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useNotificationActions() {
  const markNotificationReadMutation = useMarkNotificationReadMutation()
  const markAllNotificationsReadMutation = useMarkAllNotificationsReadMutation()

  return useMemo(
    () => ({
      markAllNotificationsRead: () => markAllNotificationsReadMutation.mutate(),
      markNotificationRead: (id: string) => markNotificationReadMutation.mutate(id),
    }),
    [markAllNotificationsReadMutation, markNotificationReadMutation],
  )
}
