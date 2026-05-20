import { getShiftTimeRange } from "@/core/date"

import type { CockpitAction, HomeCockpitDeckProps } from "./homeCockpit.types"

export function getPrimaryCockpitAction({
  nextShift,
  onOpenNotifications,
  onOpenSchedule,
  onOpenTask,
  pendingTaskCount,
  priorityTask,
  unreadCount,
}: Pick<
  HomeCockpitDeckProps,
  | "nextShift"
  | "onOpenNotifications"
  | "onOpenSchedule"
  | "onOpenTask"
  | "pendingTaskCount"
  | "priorityTask"
  | "unreadCount"
>): CockpitAction {
  if (priorityTask) {
    return {
      icon: priorityTask.completed ? "checkmark-circle-outline" : "flash-outline",
      label: priorityTask.actionLabel,
      onPress: () => onOpenTask(priorityTask),
      subtitle:
        pendingTaskCount > 1
          ? `${priorityTask.subtitle} · ${pendingTaskCount - 1} more waiting`
          : priorityTask.subtitle,
      title: priorityTask.title,
    }
  }

  if (nextShift) {
    return {
      icon: "calendar-clear-outline",
      label: "View shift",
      onPress: onOpenSchedule,
      subtitle: `${nextShift.dayLabel} · ${getShiftTimeRange(nextShift)} · ${nextShift.venueName}`,
      title: "Your next shift is lined up",
    }
  }

  if (unreadCount > 0) {
    return {
      icon: "notifications-outline",
      label: "Review updates",
      onPress: onOpenNotifications,
      subtitle: `${unreadCount} update${unreadCount === 1 ? "" : "s"} still waiting for you`,
      title: "Nothing urgent, but there is fresh activity",
    }
  }

  return {
    icon: "sparkles-outline",
    label: "Review planning",
    onPress: onOpenSchedule,
    subtitle: "You are clear for now. This is a good moment to review upcoming work.",
    title: "Everything important is under control",
  }
}
