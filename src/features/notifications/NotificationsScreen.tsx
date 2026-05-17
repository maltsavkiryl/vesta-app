/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import type { NotificationItem, NotificationKind } from "@/core/models"
import { AppScrollScreen } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import type { DesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

const iconByKind: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  announcements: "megaphone-outline",
  availability: "time-outline",
  clock: "time-outline",
  documents: "alert-circle-outline",
  payroll: "cash-outline",
  schedule: "calendar-outline",
}

const groupLabels = {
  earlier: "Earlier this week",
  today: "Today",
  yesterday: "Yesterday",
} as const

type GroupKey = keyof typeof groupLabels

function getNotificationTone(tokens: DesignTokens, kind: NotificationKind) {
  if (kind === "documents") return tokens.danger
  if (kind === "payroll") return tokens.success
  if (kind === "clock" || kind === "availability") return tokens.warning
  return tokens.accent
}

function groupNotification(notification: NotificationItem): GroupKey {
  if (notification.relativeTime.includes("h") || notification.relativeTime.includes("m")) {
    return "today"
  }
  if (notification.relativeTime.includes("1d")) return "yesterday"
  return "earlier"
}

function Header({
  onBack,
  onClearAll,
  onMarkAllRead,
  totalCount,
  unreadCount,
}: {
  onBack: () => void
  onClearAll: () => void
  onMarkAllRead: () => void
  totalCount: number
  unreadCount: number
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.header, { borderBottomColor: tokens.border }]}>
      <View style={styles.titleRow}>
        <Text
          text="Notifications"
          weight="bold"
          style={[styles.title, { color: tokens.textPrimary }]}
        />
        {unreadCount > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: tokens.danger }]}>
            <Text
              text={String(unreadCount)}
              size="xxs"
              weight="bold"
              style={{ color: "#FFFFFF" }}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.headerActions}>
        {unreadCount > 0 ? (
          <Pressable onPress={onMarkAllRead}>
            <Text
              text="Mark all read"
              size="xxs"
              weight="medium"
              style={{ color: tokens.accent }}
            />
          </Pressable>
        ) : null}
        {totalCount > 0 ? (
          <Pressable
            onPress={onClearAll}
            style={[styles.headerIconButton, { backgroundColor: tokens.background }]}
          >
            <Ionicons color={tokens.textSecondary} name="trash-outline" size={15} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={onBack}
          style={[styles.headerIconButton, { backgroundColor: tokens.background }]}
        >
          <Ionicons color={tokens.textSecondary} name="close-outline" size={17} />
        </Pressable>
      </View>
    </View>
  )
}

function EmptyState() {
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
              <Text
                text={item.relativeTime}
                size="xxs"
                style={{ color: tokens.textMuted, fontSize: 11 }}
              />
              {item.unread ? (
                <View style={[styles.dot, { backgroundColor: tokens.accent }]} />
              ) : null}
            </View>
          </View>
          <Text
            text={item.body}
            size="xxs"
            style={[styles.bodyText, { color: tokens.textSecondary }]}
          />
          {item.deepLink ? (
            <View style={[styles.cta, { backgroundColor: `${tokens.accent}10` }]}>
              <Text text="Open" size="xxs" weight="semiBold" style={{ color: tokens.accent }} />
              <Ionicons color={tokens.accent} name="chevron-forward-outline" size={12} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        style={[
          styles.dismissButton,
          { backgroundColor: tokens.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" },
        ]}
      >
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
      <View style={[styles.groupCard, { backgroundColor: tokens.background }]}>
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

export function NotificationsScreen() {
  const router = useRouter()
  const { state, markAllNotificationsRead, markNotificationRead } = useAppSession()
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const tokens = useDesignTokens()

  const visibleNotifications = state.notifications.filter((item) => !hiddenIds.includes(item.id))
  const grouped = useMemo(() => {
    return visibleNotifications.reduce<Record<GroupKey, NotificationItem[]>>(
      (acc, notification) => {
        acc[groupNotification(notification)].push(notification)
        return acc
      },
      { earlier: [], today: [], yesterday: [] },
    )
  }, [visibleNotifications])
  const unreadCount = visibleNotifications.filter((item) => item.unread).length

  const handlePress = (notification: NotificationItem) => {
    markNotificationRead(notification.id)
    if (notification.deepLink) router.push(notification.deepLink as never)
  }

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <Header
        totalCount={visibleNotifications.length}
        unreadCount={unreadCount}
        onBack={() => router.back()}
        onClearAll={() => setHiddenIds(state.notifications.map((item) => item.id))}
        onMarkAllRead={markAllNotificationsRead}
      />

      {visibleNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.groups}>
          {(["today", "yesterday", "earlier"] as GroupKey[]).map((group) => (
            <NotificationGroup
              key={group}
              label={groupLabels[group]}
              items={grouped[group]}
              onDismiss={(id) => setHiddenIds((current) => [...current, id])}
              onPress={handlePress}
            />
          ))}
          {visibleNotifications.length > 2 ? (
            <Pressable
              onPress={() => setHiddenIds(state.notifications.map((item) => item.id))}
              style={[
                styles.clearAllButton,
                { backgroundColor: `${tokens.danger}08`, borderColor: `${tokens.danger}18` },
              ]}
            >
              <Ionicons color={tokens.danger} name="trash-outline" size={15} />
              <Text
                text="Clear all notifications"
                size="xs"
                weight="medium"
                style={{ color: tokens.danger }}
              />
            </Pressable>
          ) : null}
        </View>
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    marginTop: 15,
    width: 24,
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
  groups: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  headerIconButton: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
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
    gap: 5,
  },
  notificationRow: {
    alignItems: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    overflow: "hidden",
  },
  notificationTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
    marginBottom: 3,
  },
  screen: {
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  unreadBadge: {
    alignItems: "center",
    borderRadius: 20,
    minWidth: 22,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
})
