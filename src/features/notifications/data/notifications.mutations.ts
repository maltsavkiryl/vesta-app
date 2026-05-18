import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

import { notificationsQueryKeys } from "./notifications.queries"

function invalidateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
) {
  void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list(accountId) })
  void queryClient.invalidateQueries({ queryKey: ["home", accountId] })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (id: string) => appRepositories.notifications.markRead(accountId!, id),
    onSuccess: () => {
      if (!accountId) return
      invalidateNotificationQueries(queryClient, accountId)
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: () => appRepositories.notifications.markAllRead(accountId!),
    onSuccess: () => {
      if (!accountId) return
      invalidateNotificationQueries(queryClient, accountId)
    },
  })
}

export function useNotificationActions() {
  const markNotificationReadMutation = useMarkNotificationReadMutation()
  const markAllNotificationsReadMutation = useMarkAllNotificationsReadMutation()

  return useMemo(
    () => ({
      markAllNotificationsRead: () => markAllNotificationsReadMutation.mutateAsync(),
      markNotificationRead: (id: string) => markNotificationReadMutation.mutateAsync(id),
    }),
    [markAllNotificationsReadMutation, markNotificationReadMutation],
  )
}
