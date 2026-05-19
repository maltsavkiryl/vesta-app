import { StyleSheet, View } from "react-native"

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
    { label: "Employer", value: employerName ?? "Pending" },
    { label: "Availability", value: `${availabilityDays.length} days/week` },
    { label: "Notifications", value: `${enabledNotifications} enabled` },
  ]

  return (
    <View style={onboardingStyles.section}>
      <SuccessState
        icon="checkmark-outline"
        style={styles.successState}
        subtitle="Your Vesta account is ready. Here's what we set up for you."
        title="You're all set!"
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
