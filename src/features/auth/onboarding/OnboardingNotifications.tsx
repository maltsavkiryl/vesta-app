import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { ListCard, ListCardItem, Text, ToggleSwitch, appTypography, useDesignTokens } from "@/ui"

import { onboardingStyles } from "./onboarding.styles"
import { ONBOARDING_NOTIFICATION_OPTIONS } from "./types"

export interface OnboardingNotificationsProps {
  notifications: Record<string, boolean>
  onToggle: (key: string) => void
}

export function OnboardingNotifications({ notifications, onToggle }: OnboardingNotificationsProps) {
  const tokens = useDesignTokens()

  return (
    <View style={onboardingStyles.section}>
      <View style={onboardingStyles.titleBlock}>
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
      <ListCard style={styles.notificationList}>
        {ONBOARDING_NOTIFICATION_OPTIONS.map((item, index) => (
          <ListCardItem
            key={item.key}
            isLast={index === ONBOARDING_NOTIFICATION_OPTIONS.length - 1}
            leading={
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
                ]}
              >
                <Ionicons color={tokens.textSecondary} name={item.icon} size={16} />
              </View>
            }
            subtitle={item.desc}
            subtitleStyle={{ color: tokens.textMuted }}
            title={item.label}
            titleStyle={{ color: tokens.textPrimary }}
            trailing={
              <ToggleSwitch value={notifications[item.key]} onChange={() => onToggle(item.key)} />
            }
          />
        ))}
      </ListCard>
    </View>
  )
}

const styles = StyleSheet.create({
  notificationIcon: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  notificationList: {
    gap: 0,
  },
})
