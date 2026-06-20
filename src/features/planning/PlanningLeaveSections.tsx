/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LeaveEntitlement } from "@/core/models"
import {
  EmptyState,
  MetricGrid,
  SurfaceCard,
  useDesignTokens,
} from "@/ui"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"

// ── Leave entitlement card ────────────────────────────────────────────────────

export function PlanningLeaveBalanceCard({ entitlement }: { entitlement: LeaveEntitlement }) {
  const tokens = useDesignTokens()
  const year = entitlement.calendarYear
  const hasHours = entitlement.entitlementHours > 0
  const isSynced = entitlement.source === 1

  const metricItems = [
    { label: "Wettelijk", value: `${entitlement.statutoryDays}d` },
    { label: "Werkgever", value: `${entitlement.employerPolicyDays}d` },
    { label: "Totaal", value: `${entitlement.totalDays}d` },
    ...(hasHours
      ? [{ label: "Uren", value: `${entitlement.entitlementHours}u` }]
      : []),
  ]

  return (
    <SurfaceCard style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={translate("planning:leave.currentYear", { year: String(year) }).toUpperCase()}
          weight="semiBold"
        />
        <Ionicons color={tokens.textMuted} name="leaf-outline" size={16} />
      </View>
      <MetricGrid items={metricItems} />
      {isSynced ? (
        <Text
          size="xxs"
          style={{ color: tokens.textMuted }}
          text={translate("planning:leave.syncedFromPayroll")}
        />
      ) : null}
    </SurfaceCard>
  )
}

export function PlanningLeaveBalanceEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      cardless
      icon={<Ionicons color={tokens.textMuted} name="leaf-outline" size={18} />}
      subtitle={translate("planning:leave.noLeaveSubtitle")}
      title={translate("planning:leave.noLeaveTitle")}
    />
  )
}

const styles = StyleSheet.create({
  balanceCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  balanceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
