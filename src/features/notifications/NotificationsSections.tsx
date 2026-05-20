import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { NotificationItem, NotificationKind } from "@/core/models"
import { Text, useDesignTokens } from "@/ui"
import type { DesignTokens } from "@/ui"

import { groupLabels, type NotificationGroupKey } from "./useNotificationsScreen"

const iconByKind: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  announcements: "megaphone-outline",
  availability: "time-outline",
  clock: "time-outline",
  documents: "alert-circle-outline",
  payroll: "cash-outline",
  schedule: "calendar-outline",
}

function getNotificationTone(tokens: DesignTokens, kind: NotificationKind) {
  if (kind === "documents") return tokens.danger
  if (kind === "payroll") return tokens.success
  if (kind === "clock" || kind === "availability") return tokens.warning
  return tokens.accent
}

export function NotificationsEmptyState() {
  const tokens = useDesignTokens()

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: tokens.surface }]}>
        <Ionicons color={tokens.textMuted} name="notifications-outline" size={30} />
      </View>
      <Text
        text="All caught up!"
        size="sm"
        weight="semiBold"
        style={{ color: tokens.textPrimary }}
      />
      <Text
        text="No notifications right now. We'll let you know when something needs your attention."
        size="xs"
        style={[styles.emptyText, { color: tokens.textSecondary }]}
      />
    </View>
  )
}

export function NotificationsUnreadActions({
  onMarkAllRead,
  unreadCount,
}: {
  onMarkAllRead: () => void
  unreadCount: number
}) {
  const tokens = useDesignTokens()
  if (unreadCount <= 0) return null

  return (
    <View style={styles.actionsRow}>
      <View style={[styles.unreadBadge, { backgroundColor: tokens.danger }]}>
        <Text text={`${unreadCount} unread`} size="xxs" weight="medium" style={styles.whiteText} />
      </View>
      <Pressable onPress={onMarkAllRead}>
        <Text text="Mark all read" size="xxs" weight="medium" style={{ color: tokens.accent }} />
      </Pressable>
    </View>
  )
}

export function NotificationsGroupList({
  grouped,
  onDismiss,
  onPress,
}: {
  grouped: Record<NotificationGroupKey, NotificationItem[]>
  onDismiss: (id: string) => void
  onPress: (notification: NotificationItem) => void
}) {
  return (
    <>
      {(["today", "yesterday", "earlier"] as NotificationGroupKey[]).map((group) => (
        <NotificationGroup
          key={group}
          items={grouped[group]}
          label={groupLabels[group]}
          onDismiss={onDismiss}
          onPress={onPress}
        />
      ))}
    </>
  )
}

export function NotificationsClearAll({
  onClearAll,
  visible,
}: {
  onClearAll: () => void
  visible: boolean
}) {
  const tokens = useDesignTokens()
  if (!visible) return null

  return (
    <Pressable
      onPress={onClearAll}
      style={[
        styles.clearAllButton,
        { backgroundColor: `${tokens.danger}08`, borderColor: `${tokens.danger}18` },
      ]}
    >
      <Ionicons color={tokens.danger} name="trash-outline" size={15} />
      <Text text="Clear all notifications" size="xs" weight="medium" style={{ color: tokens.danger }} />
    </Pressable>
  )
}

function NotificationRow({
  item,
  onDismiss,
  onPress,
}: {
  item: NotificationItem
  onDismiss: () => void
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const color = getNotificationTone(tokens, item.kind)

  return (
    <View
      style={[
        styles.notificationRow,
        {
          backgroundColor: item.unread ? `${tokens.accent}08` : tokens.transparent,
          borderBottomColor: tokens.border,
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.notificationMain}>
        <View style={[styles.notificationIcon, { backgroundColor: `${color}14` }]}>
          <Ionicons color={color} name={iconByKind[item.kind]} size={18} />
        </View>
        <View style={styles.flex}>
          <View style={styles.notificationTitleRow}>
            <Text
              text={item.title}
              size="xs"
              weight={item.unread ? "semiBold" : "medium"}
              style={[styles.flex, { color: tokens.textPrimary }]}
            />
            <View style={styles.notificationMeta}>
              <Text text={item.relativeTime} size="xxs" style={[styles.metaText, { color: tokens.textMuted }]} />
              {item.unread ? <View style={[styles.dot, { backgroundColor: tokens.accent }]} /> : null}
            </View>
          </View>
          <Text text={item.body} size="xxs" style={[styles.bodyText, { color: tokens.textSecondary }]} />
          {item.action ? (
            <View style={[styles.cta, { backgroundColor: `${tokens.accent}10` }]}>
              <Text text="Open" size="xxs" weight="semiBold" style={{ color: tokens.accent }} />
              <Ionicons color={tokens.accent} name="chevron-forward-outline" size={12} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable hitSlop={10} onPress={onDismiss} style={styles.dismissButton}>
        <Ionicons color={tokens.textMuted} name="close-outline" size={13} />
      </Pressable>
    </View>
  )
}

function NotificationGroup({
  items,
  label,
  onDismiss,
  onPress,
}: {
  items: NotificationItem[]
  label: string
  onDismiss: (id: string) => void
  onPress: (notification: NotificationItem) => void
}) {
  const tokens = useDesignTokens()
  if (items.length === 0) return null

  return (
    <View style={styles.group}>
      <Text
        text={label.toUpperCase()}
        size="xxs"
        weight="semiBold"
        style={[styles.groupLabel, { color: tokens.textMuted }]}
      />
      <View style={[styles.groupCard, { backgroundColor: tokens.surface }]}>
        {items.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            onDismiss={() => onDismiss(item.id)}
            onPress={() => onPress(item)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    minHeight: 28,
  },
  bodyText: {
    lineHeight: 18,
    marginBottom: 8,
  },
  clearAllButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 14,
    padding: 13,
  },
  cta: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 8,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dismissButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 34,
  },
  dot: {
    borderRadius: 3.5,
    height: 7,
    width: 7,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  emptyText: {
    lineHeight: 21,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
  group: {
    marginTop: 14,
  },
  groupCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    overflow: "hidden",
  },
  groupLabel: {
    letterSpacing: 0,
    marginBottom: 8,
    paddingLeft: 2,
  },
  metaText: {
    fontSize: 11,
  },
  notificationIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginTop: 1,
    width: 40,
  },
  notificationMain: {
    flex: 1,
    flexDirection: "row",
    gap: 11,
    padding: 13,
  },
  notificationMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginLeft: 10,
  },
  notificationRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  notificationTitleRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  unreadBadge: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  whiteText: {
    color: "#FFFFFF",
  },
})
