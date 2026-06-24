import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { useDesignTokens } from "@/ui"

import type { HomeCockpitDeckProps } from "./homeCockpit.types"
import { getPrimaryCockpitAction } from "./homeCockpit.utils"
import { HomeCockpitMiniCard, HomeCockpitPrimaryCard } from "./HomeCockpitCards"

export function HomeCockpitDeck({
  nextShift,
  onOpenNotifications,
  onOpenSchedule,
  onOpenTask,
  onOpenTasks,
  pendingTaskCount,
  priorityTask,
  unreadCount,
}: HomeCockpitDeckProps) {
  const tokens = useDesignTokens()
  const primaryAction = getPrimaryCockpitAction({
    nextShift,
    onOpenNotifications,
    onOpenSchedule,
    onOpenTask,
    pendingTaskCount,
    priorityTask,
    unreadCount,
  })

  const miniCards = [
    {
      icon: "checkbox-outline" as const,
      label:
        pendingTaskCount > 0
          ? translate("home:cockpit.pendingCount", { count: pendingTaskCount })
          : translate("home:cockpit.allClear"),
      onPress: onOpenTasks,
      title: translate("home:tasks.title"),
      tone: pendingTaskCount > 0 ? tokens.warning : tokens.success,
    },
    {
      icon: "calendar-outline" as const,
      label: nextShift
        ? `${nextShift.dayLabel} ${nextShift.startTime}`
        : translate("home:cockpit.nothingQueued"),
      onPress: onOpenSchedule,
      title: translate("planning:sections.tabs.shifts"),
      tone: tokens.accent,
    },
    {
      icon: "notifications-outline" as const,
      label:
        unreadCount > 0
          ? translate("home:cockpit.waitingCount", { count: unreadCount })
          : translate("home:cockpit.caughtUp"),
      onPress: onOpenNotifications,
      title: translate("home:updates.title"),
      tone: unreadCount > 0 ? tokens.danger : tokens.textSecondary,
    },
  ]

  return (
    <View style={styles.stack}>
      <HomeCockpitPrimaryCard action={primaryAction} />

      <View style={styles.miniGrid}>
        {miniCards.map((card) => (
          <HomeCockpitMiniCard
            key={card.title}
            icon={card.icon}
            label={card.label}
            onPress={card.onPress}
            title={card.title}
            tone={card.tone}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  miniGrid: {
    flexDirection: "row",
    gap: 10,
  },
  stack: {
    gap: 10,
  },
})
