import { StyleSheet, View } from "react-native"

import { useDesignTokens } from "@/ui"

import { HomeCockpitMiniCard, HomeCockpitPrimaryCard } from "./HomeCockpitCards"
import type { HomeCockpitDeckProps } from "./homeCockpit.types"
import { getPrimaryCockpitAction } from "./homeCockpit.utils"

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
      label: pendingTaskCount > 0 ? `${pendingTaskCount} pending` : "All clear",
      onPress: onOpenTasks,
      title: "Tasks",
      tone: pendingTaskCount > 0 ? tokens.warning : tokens.success,
    },
    {
      icon: "calendar-outline" as const,
      label: nextShift ? `${nextShift.dayLabel} ${nextShift.startTime}` : "Nothing queued",
      onPress: onOpenSchedule,
      title: "Planning",
      tone: tokens.accent,
    },
    {
      icon: "notifications-outline" as const,
      label: unreadCount > 0 ? `${unreadCount} waiting` : "Caught up",
      onPress: onOpenNotifications,
      title: "Updates",
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
