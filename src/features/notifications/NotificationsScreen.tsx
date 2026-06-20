import { StyleSheet, View } from "react-native"

import { AppScrollScreen, Text, appLayout, useDesignTokens } from "@/ui"

import {
  NotificationsClearAll,
  NotificationsEmptyState,
  NotificationsGroupList,
  NotificationsUnreadActions,
} from "./NotificationsSections"
import { useNotificationsScreen } from "./useNotificationsScreen"

export function NotificationsScreen() {
  const {
    archiveAllNotifications,
    archiveNotification,
    grouped,
    handlePress,
    markAllNotificationsRead,
    notifications,
    unreadCount,
  } = useNotificationsScreen()
  const tokens = useDesignTokens()

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.screen}
      topInset="none"
      variant="grouped"
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <Text
        preset="heading"
        text="Inbox"
        weight="bold"
        style={[styles.title, { color: tokens.textPrimary }]}
      />
      {notifications.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        <View>
          <NotificationsUnreadActions
            onMarkAllRead={() => {
              void markAllNotificationsRead()
            }}
            unreadCount={unreadCount}
          />
          <NotificationsGroupList
            grouped={grouped}
            onDismiss={(id) => {
              void archiveNotification(id)
            }}
            onPress={handlePress}
          />
          <NotificationsClearAll
            onClearAll={() => {
              void archiveAllNotifications()
            }}
            visible={notifications.length > 2}
          />
        </View>
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingBottom: 36,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 12,
    marginTop: 4,
  },
})
