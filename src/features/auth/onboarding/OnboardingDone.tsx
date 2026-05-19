import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Text, appTypography, useDesignTokens } from "@/ui"

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
    <View style={[styles.stackLarge, styles.doneContent]}>
      <View style={[styles.doneIcon, { backgroundColor: tokens.successSoft }]}>
        <Ionicons color={tokens.success} name="checkmark-outline" size={44} />
      </View>
      <View style={styles.titleBlock}>
        <Text
          text="You're all set!"
          weight="bold"
          style={[appTypography.authTitle, { color: tokens.textPrimary, textAlign: "center" }]}
        />
        <Text
          text="Your Vesta account is ready. Here's what we set up for you."
          size="xs"
          style={{ color: tokens.textSecondary, textAlign: "center" }}
        />
      </View>
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
        ]}
      >
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.summaryRow,
              index < rows.length - 1
                ? { borderBottomColor: tokens.border, borderBottomWidth: 1 }
                : null,
            ]}
          >
            <Text text={row.label} size="xs" style={{ color: tokens.textSecondary }} />
            <Text
              text={row.value}
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary }}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  doneContent: {
    alignItems: "center",
    paddingTop: 16,
  },
  doneIcon: {
    alignItems: "center",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  stackLarge: {
    gap: 20,
  },
  summaryCard: {
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  titleBlock: {
    gap: 6,
  },
})
