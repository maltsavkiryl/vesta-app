/* eslint-disable react-native/no-inline-styles */

import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

export function HomeHeader({
  employerName,
  firstName,
  greeting,
  hasUnread,
  role,
  onEmployerPress,
  onNotificationsPress,
}: {
  employerName?: string
  firstName: string
  greeting: string
  hasUnread: boolean
  role?: string
  onEmployerPress: () => void
  onNotificationsPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <Text text={greeting} size="xxs" style={{ color: tokens.textSecondary }} />
        <Text
          text={firstName}
          weight="bold"
          style={[styles.headerTitle, { color: tokens.textPrimary }]}
        />
        {employerName ? (
          <Pressable onPress={onEmployerPress} style={styles.employerButton}>
            <View style={[styles.employerDot, { backgroundColor: tokens.success }]} />
            <Text
              text={role ? `${employerName} · ${role}` : employerName}
              numberOfLines={1}
              size="xxs"
              weight="medium"
              style={[styles.employerLabel, { color: tokens.accent }]}
            />
            <Ionicons color={tokens.accent} name="chevron-down-outline" size={13} />
          </Pressable>
        ) : null}
      </View>

      <Pressable hitSlop={10} onPress={onNotificationsPress}>
        <View style={[styles.notificationButton, { backgroundColor: tokens.surface }]}>
          <Ionicons color={tokens.textPrimary} name="notifications-outline" size={19} />
          {hasUnread ? (
            <View
              style={[
                styles.notificationDot,
                { backgroundColor: tokens.danger, borderColor: tokens.background },
              ]}
            />
          ) : null}
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  employerButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
    maxWidth: 260,
  },
  employerDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  employerLabel: {
    flexShrink: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
  },
  notificationButton: {
    alignItems: "center",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    width: 38,
  },
  notificationDot: {
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 7,
    top: 7,
    width: 10,
  },
})
