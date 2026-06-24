import { getShiftTimeRange } from "@/core/date"
import { translate } from "@/i18n/translate"

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
          ? `${priorityTask.subtitle} · ${translate("home:cockpit.morePending", { count: pendingTaskCount - 1 })}`
          : priorityTask.subtitle,
      title: priorityTask.title,
    }
  }

  if (nextShift) {
    return {
      icon: "calendar-clear-outline",
      label: translate("home:cockpit.viewShift"),
      onPress: onOpenSchedule,
      subtitle: `${nextShift.dayLabel} · ${getShiftTimeRange(nextShift)} · ${nextShift.venueName}`,
      title: translate("home:cockpit.nextShiftTitle"),
    }
  }

  if (unreadCount > 0) {
    return {
      icon: "notifications-outline",
      label: translate("home:cockpit.reviewUpdates"),
      onPress: onOpenNotifications,
      subtitle: translate("home:cockpit.updatesWaiting", { count: unreadCount }),
      title: translate("home:cockpit.freshActivity"),
    }
  }

  return {
    icon: "sparkles-outline",
    label: translate("home:cockpit.reviewPlanning"),
    onPress: onOpenSchedule,
    subtitle: translate("home:cockpit.clearBody"),
    title: translate("home:cockpit.underControl"),
  }
}
