import { getRelativeDayLabel } from "@/core/date"
import type { NotificationItem, Shift } from "@/core/models"

import type { TaskItem } from "./components/HomeTaskSections"

const URGENCY_RANK: Record<TaskItem["urgency"], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/**
 * Orders tasks so the most urgent work surfaces first. Stable within an
 * urgency tier so the underlying source order is otherwise preserved.
 */
export function sortTasksByUrgency(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((left, right) => URGENCY_RANK[left.urgency] - URGENCY_RANK[right.urgency])
}

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
  const sortedTasks = sortTasksByUrgency(pendingTasks)
  const priorityTask = sortedTasks[0]
  const nextShift = upcomingShifts[0]
  const hasPendingTasks = pendingTasks.length > 0
  const hasMultiplePendingTasks = pendingTasks.length > 1
  const hasMeaningfulUpdates = notifications.length > 0
  const hasMultipleMeaningfulUpdates = notifications.length > 1
  const homeSummary = priorityTask
    ? ""
    : nextShift
      ? `Next shift ${nextShift.date ? getRelativeDayLabel(nextShift.date) : nextShift.dayLabel} at ${nextShift.startTime}`
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
    sortedTasks,
    // Surface a single urgent task or update on home — waiting for "2+" buried
    // high-priority work like "Upload your ID card".
    shouldShowTasksSection: hasPendingTasks,
    shouldShowUpdatesSection: hasMeaningfulUpdates,
  }
}
