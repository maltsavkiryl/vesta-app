import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { SelectionCard, Text, appTypography, useDesignTokens } from "@/ui"

import { onboardingStyles } from "./onboarding.styles"
import { ONBOARDING_ROLES } from "./types"

export interface OnboardingRoleProps {
  selectedRole: string
  onSelectRole: (role: string) => void
}

export function OnboardingRole({ selectedRole, onSelectRole }: OnboardingRoleProps) {
  const tokens = useDesignTokens()

  return (
    <View style={onboardingStyles.section}>
      <View style={onboardingStyles.titleBlock}>
        <Text
          text="What's your role?"
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text="We'll personalize your experience for how you work."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={styles.roleGrid}>
        {ONBOARDING_ROLES.map((role) => {
          return (
            <SelectionCard
              key={role.id}
              onPress={() => onSelectRole(role.id)}
              selected={selectedRole === role.id}
              style={styles.roleCard}
              title={role.label}
              icon={<Ionicons color={tokens.textPrimary} name={role.icon} size={22} />}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  roleCard: {
    width: "31%",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
})
