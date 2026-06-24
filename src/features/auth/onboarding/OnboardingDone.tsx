import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { ListCard, ListCardItem, SuccessState, Text, useDesignTokens } from "@/ui"

import { onboardingStyles } from "./onboarding.styles"

export interface OnboardingDoneProps {
  email: string
  fullName: string
  phone: string
}

export function OnboardingDone({ email, fullName, phone }: OnboardingDoneProps) {
  const tokens = useDesignTokens()
  const notProvided = translate("onboarding:doneSummary.notProvided")
  const rows = [
    {
      label: translate("onboarding:doneSummary.nameLabel"),
      value: fullName || notProvided,
    },
    {
      label: translate("onboarding:doneSummary.emailLabel"),
      value: email || notProvided,
    },
    {
      label: translate("onboarding:doneSummary.phoneLabel"),
      value: phone || notProvided,
    },
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
