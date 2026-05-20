import { memo } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { HomeTask, NotificationItem } from "@/core/models"
import { ListCardItem, Text, useDesignTokens } from "@/ui"
import type { DesignTokens } from "@/ui"

const notificationIconByKind = {
  announcements: "megaphone-outline",
  availability: "calendar-number-outline",
  clock: "time-outline",
  documents: "alert-circle-outline",
  payroll: "document-text-outline",
  schedule: "calendar-outline",
} as const

const taskIconByUrgency = {
  high: "alert-circle-outline",
  low: "calendar-outline",
  medium: "alert-circle-outline",
} as const

type IconName = keyof typeof Ionicons.glyphMap
type Tone = "accent" | "success" | "warning" | "danger"
export type TaskItem = HomeTask & { completedDate?: string }

export const completedTaskHistory: TaskItem[] = [
  {
    action: { route: "/profile/contracts", type: "navigate" },
    actionLabel: "Sign",
    completed: true,
    completedDate: "Apr 20",
    id: "task-history-1",
    subtitle: "Addendum requires your signature",
    title: "Sign schedule amendment",
    urgency: "medium",
  },
  {
    action: { route: "/(app)/(tabs)/profile", type: "navigate" },
    actionLabel: "Update",
    completed: true,
    completedDate: "Apr 15",
    id: "task-history-2",
    subtitle: "Required for payroll",
    title: "Update bank details",
    urgency: "high",
  },
  {
    action: { route: "/(app)/(tabs)/schedule", type: "navigate" },
    actionLabel: "Done",
    completed: true,
    completedDate: "Apr 1",
    id: "task-history-3",
    subtitle: "Completed on time",
    title: "Set April availability",
    urgency: "low",
  },
]

function getToneColor(tokens: DesignTokens, tone: Tone) {
  return {
    accent: tokens.accent,
    danger: tokens.danger,
    success: tokens.success,
    warning: tokens.warning,
  }[tone]
}

function ToneIcon({ name, tone }: { name: IconName; tone: Tone }) {
  const tokens = useDesignTokens()
  const color = getToneColor(tokens, tone)

  return (
    <View style={[styles.iconTile, { backgroundColor: `${color}14` }]}>
      <Ionicons color={color} name={name} size={17} />
    </View>
  )
}

export const TaskRow = memo(function TaskRow({
  isLast,
  item,
  onComplete,
}: {
  isLast?: boolean
  item: TaskItem
  onComplete: () => void
}) {
  const tokens = useDesignTokens()
  const tone = item.urgency === "high" ? "danger" : item.urgency === "medium" ? "warning" : "accent"

  return (
    <ListCardItem
      isLast={isLast}
      leading={
        <ToneIcon
          name={item.completed ? "checkmark-circle-outline" : taskIconByUrgency[item.urgency]}
          tone={item.completed ? "success" : tone}
        />
      }
      style={{ backgroundColor: tokens.surface }}
      subtitle={item.completed ? `Done ${item.completedDate}` : item.subtitle}
      subtitleStyle={{ color: item.completed ? tokens.textMuted : tokens.textSecondary }}
      title={item.title}
      titleStyle={[
        { color: item.completed ? tokens.textSecondary : tokens.textPrimary },
        item.completed && styles.completedText,
      ]}
      trailing={
        item.completed ? (
          <Ionicons color={tokens.success} name="checkmark-circle-outline" size={17} />
        ) : (
          <View style={styles.taskActions}>
            <Pressable
              onPress={onComplete}
              style={[styles.taskButton, { backgroundColor: `${tokens.accent}14` }]}
            >
              <Text
                text={item.actionLabel}
                size="xxs"
                weight="semiBold"
                style={{ color: tokens.accent }}
              />
            </Pressable>
          </View>
        )
      }
    />
  )
})

export function UpdateRow({
  isLast,
  item,
  onPress,
}: {
  isLast?: boolean
  item: NotificationItem
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const tone = item.kind === "documents" ? "danger" : item.kind === "payroll" ? "success" : "accent"

  return (
    <ListCardItem
      isLast={isLast}
      leading={<ToneIcon name={notificationIconByKind[item.kind]} tone={tone} />}
      onPress={onPress}
      subtitle={item.body}
      subtitleStyle={{ color: tokens.textSecondary }}
      title={item.title}
      titleStyle={{ color: tokens.textPrimary }}
      trailing={
        <View style={styles.updateTrailing}>
          <Text text={item.relativeTime} size="xxs" style={{ color: tokens.textMuted }} />
          <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  completedText: {
    textDecorationLine: "line-through",
  },
  iconTile: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  taskActions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 4,
  },
  taskButton: {
    borderCurve: "continuous",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  updateTrailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})
