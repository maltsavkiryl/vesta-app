import type { NotificationItem, Shift } from "@/core/models"

import type { TaskItem } from "./components/HomeTaskSections"

export function deriveHomeScreenPolicy({
  notifications,
  pendingTasks,
  unreadCount,
  upcomingShifts,
}: {
  notifications: NotificationItem[]
  pendingTasks: TaskItem[]
  unreadCount: number
  upcomingShifts: Shift[]
}) {
  const priorityTask = pendingTasks[0]
  const nextShift = upcomingShifts[0]
  const hasPendingTasks = pendingTasks.length > 0
  const hasMultiplePendingTasks = pendingTasks.length > 1
  const hasMeaningfulUpdates = notifications.length > 0
  const hasMultipleMeaningfulUpdates = notifications.length > 1
  const homeSummary = priorityTask
    ? ""
    : nextShift
      ? `Next shift ${nextShift.dayLabel} at ${nextShift.startTime}`
      : unreadCount > 0
        ? `${unreadCount} update${unreadCount === 1 ? "" : "s"} waiting`
        : "You're clear for now"

  return {
    hasMeaningfulUpdates,
    hasMultipleMeaningfulUpdates,
    hasMultiplePendingTasks,
    hasPendingTasks,
    homeSummary,
    nextShift,
    priorityTask,
    shouldShowTasksSection: hasMultiplePendingTasks,
    shouldShowUpdatesSection: hasMultipleMeaningfulUpdates,
  }
}
