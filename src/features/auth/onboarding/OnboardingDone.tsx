import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { ListCard, ListCardItem, SuccessState, Text, useDesignTokens } from "@/ui"

import { onboardingStyles } from "./onboarding.styles"

export interface OnboardingDoneProps {
  availabilityDays: string[]
  employerName?: string
  enabledNotifications: number
  role: string
}

export function OnboardingDone({
  availabilityDays,
  employerName,
  enabledNotifications,
  role,
}: OnboardingDoneProps) {
  const tokens = useDesignTokens()
  const rows = [
    { label: "Role", value: role || "Waiter" },
    { label: "Workplace", value: employerName ?? "No workplace selected" },
    { label: "Availability", value: `${availabilityDays.length} days/week` },
    { label: "Notifications", value: `${enabledNotifications} enabled` },
  ]

  return (
    <View style={onboardingStyles.section}>
      <SuccessState
        icon="checkmark-outline"
        style={styles.successState}
        subtitle={translate("onboarding:done.subtitle")}
        title={translate("onboarding:done.title")}
      />
      <ListCard style={styles.summaryCard}>
        {rows.map((row, index) => (
          <ListCardItem
            key={row.label}
            isLast={index === rows.length - 1}
            title={row.label}
            titleStyle={{ color: tokens.textSecondary }}
            trailing={
              <Text text={row.value} size="xs" weight="medium" style={styles.summaryValue} />
            }
          />
        ))}
      </ListCard>
    </View>
  )
}

const styles = StyleSheet.create({
  successState: {
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  summaryCard: {
    gap: 0,
  },
  summaryValue: {
    textAlign: "right",
  },
})
