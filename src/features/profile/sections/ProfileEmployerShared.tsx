import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import { AppButton, MetricGrid, Text, useDesignTokens } from "@/ui"

export function getEmployerInitial(name: string) {
  return name.slice(0, 1).toUpperCase()
}

export function EmployerInitialBadge({
  backgroundColor,
  name,
}: {
  backgroundColor: string
  name: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.employerInitial, { backgroundColor }]}>
      <Text
        text={getEmployerInitial(name)}
        size="sm"
        weight="bold"
        style={{ color: tokens.accentForeground }}
      />
    </View>
  )
}

export function EmployerPreviewCard({
  employer,
  onJoin,
}: {
  employer: Employer
  onJoin: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.joinPreviewCard,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.accent,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View style={styles.joinPreviewHeader}>
        <EmployerInitialBadge backgroundColor={tokens.accent} name={employer.name} />
        <View style={styles.employerCopy}>
          <Text
            text={employer.name}
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${employer.type} - ${employer.city}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <View style={styles.ratingRow}>
          <Ionicons color={tokens.warning} name="star" size={13} />
          <Text
            text={String(employer.rating)}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
        </View>
      </View>
      <MetricGrid
        items={[
          { label: "People", value: String(employer.teamSize) },
          { label: "Status", value: "Hiring" },
          { label: "Type", value: employer.type },
        ]}
      />
      <AppButton label="Request to join" onPress={onJoin} pressHaptic="none" />
    </View>
  )
}

const styles = StyleSheet.create({
  employerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  employerInitial: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  joinPreviewCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  joinPreviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
})
