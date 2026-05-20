import { Ionicons } from "@expo/vector-icons"
import type { Shift } from "@/core/models"

import type { TaskItem } from "./HomeTaskSectionRows"

export type CockpitAction = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  subtitle: string
  title: string
}

export type HomeCockpitDeckProps = {
  nextShift?: Shift
  onOpenNotifications: () => void
  onOpenSchedule: () => void
  onOpenTask: (task: TaskItem) => void
  onOpenTasks: () => void
  pendingTaskCount: number
  priorityTask?: TaskItem
  unreadCount: number
}
