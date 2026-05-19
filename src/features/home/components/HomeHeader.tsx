import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

export function HomeHeader({
  firstName,
  greeting,
  hasUnread,
  onNotificationsPress,
}: {
  firstName: string
  greeting: string
  hasUnread: boolean
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
