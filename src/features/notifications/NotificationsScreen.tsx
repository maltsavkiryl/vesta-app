/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"

import { AppScrollScreen, appLayout, useDesignTokens } from "@/ui"

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
})
