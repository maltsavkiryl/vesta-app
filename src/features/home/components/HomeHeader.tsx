import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { MetaPill, Text, useDesignTokens } from "@/ui"

export function HomeHeader({
  firstName,
  greeting,
  hasUnread,
  onNotificationsPress,
  summary,
}: {
  firstName: string
  greeting: string
  hasUnread: boolean
  onNotificationsPress: () => void
  summary: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <View style={styles.topRow}>
          <Text text={greeting} size="xxs" weight="medium" style={{ color: tokens.textSecondary }} />
          <MetaPill
            backgroundColor={`${tokens.accent}12`}
            label="Action cockpit"
            leading={<Ionicons color={tokens.accent} name="sparkles-outline" size={11} />}
            textStyle={{ color: tokens.accent }}
          />
        </View>
        <Text
          text={firstName}
          weight="bold"
          style={[styles.headerTitle, { color: tokens.textPrimary }]}
        />
        <Text text={summary} size="xs" style={[styles.summary, { color: tokens.textSecondary }]} />
      </View>

      <Pressable hitSlop={10} onPress={onNotificationsPress}>
        <View
          style={[
            styles.notificationButton,
            {
              backgroundColor: tokens.surface,
              borderColor: tokens.border,
              shadowColor: tokens.shadow,
            },
          ]}
        >
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
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
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
  summary: {
    marginTop: 4,
    maxWidth: 260,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 2,
  },
})
