import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Text, ToggleSwitch, appTypography, useDesignTokens } from "@/ui"
import { ONBOARDING_NOTIFICATION_OPTIONS } from "./types"

export interface OnboardingNotificationsProps {
  notifications: Record<string, boolean>
  onToggle: (key: string) => void
}

export function OnboardingNotifications({ notifications, onToggle }: OnboardingNotificationsProps) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="Stay in the loop"
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text="Choose what updates you'd like to receive. You can change these anytime."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={[styles.notificationList, { borderColor: tokens.border }]}>
        {ONBOARDING_NOTIFICATION_OPTIONS.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.notificationRow,
              index < ONBOARDING_NOTIFICATION_OPTIONS.length - 1
                ? { borderBottomColor: tokens.border, borderBottomWidth: 1 }
                : null,
            ]}
          >
            <View
              style={[
                styles.notificationIcon,
                { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
              ]}
            >
              <Ionicons color={tokens.textSecondary} name={item.icon} size={16} />
            </View>
            <View style={styles.flex}>
              <Text text={item.label} size="xs" style={{ color: tokens.textPrimary }} />
              <Text text={item.desc} size="xxs" style={{ color: tokens.textMuted }} />
            </View>
            <ToggleSwitch value={notifications[item.key]} onChange={() => onToggle(item.key)} />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  notificationIcon: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  notificationList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  notificationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  stackLarge: {
    gap: 20,
  },
  titleBlock: {
    gap: 6,
  },
})
