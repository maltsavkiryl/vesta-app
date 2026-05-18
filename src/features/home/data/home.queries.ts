import { useMemo } from "react"

import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

export function useHomeQuery() {
  const { accountId } = useAuthSession()
  const query = useCurrentAppStateQuery(accountId, (state) => {
    const selectedEmployer = state.employers.find(
      (employer) => employer.id === state.activeEmployerId,
    )
    return {
      earnings: state.earnings,
      notifications: state.notifications,
      profile: state.profile,
      selectedEmployer,
      shifts: state.shifts,
      tasks: state.tasks,
      unreadNotifications: state.notifications.filter((notification) => notification.unread).length,
    }
  })

  return useMemo(() => query.data, [query.data])
}
