import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LeaveEntitlement } from "@/core/models"
import {
  EmptyState,
  MetricGrid,
  Pill,
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
    { label: translate("planning:leave.statutory"), value: `${entitlement.statutoryDays}d` },
    { label: translate("planning:leave.employer"), value: `${entitlement.employerPolicyDays}d` },
    { label: translate("planning:leave.total"), value: `${entitlement.totalDays}d` },
    ...(hasHours
      ? [{ label: translate("planning:leave.hoursLabel"), value: `${entitlement.entitlementHours}u` }]
      : []),
  ]

  return (
    <SurfaceCard elevationLevel={1} style={styles.balanceCard}>
      {/* Header row */}
      <View style={styles.balanceHeader}>
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={translate("planning:leave.currentYear", { year: String(year) }).toUpperCase()}
          weight="semiBold"
        />
        <View style={[styles.leafIconContainer, { backgroundColor: tokens.accentMuted }]}>
          <Ionicons color={tokens.accent} name="leaf-outline" size={18} />
        </View>
      </View>

      {/* Hero: totalDays as large confident number */}
      <View style={styles.heroRow}>
        <Text
          style={[styles.heroNumber, { color: tokens.accent }]}
          text={String(entitlement.totalDays)}
          weight="bold"
        />
        <Text
          size="sm"
          style={[styles.heroLabel, { color: tokens.textSecondary }]}
          text={translate("planning:leave.entitlement").toLowerCase()}
          weight="medium"
        />
      </View>

      {/* Breakdown grid */}
      <MetricGrid items={metricItems} />

      {/* Synced badge */}
      {isSynced ? (
        <View style={styles.syncedRow}>
          <Pill label={translate("planning:leave.syncedFromPayroll")} tone="success" />
        </View>
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
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  balanceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroLabel: {
    alignSelf: "flex-end",
    marginBottom: 8,
    marginLeft: 6,
  },
  heroNumber: {
    fontSize: 48,
    lineHeight: 52,
  },
  heroRow: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  leafIconContainer: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  syncedRow: {
    alignItems: "flex-start",
  },
})
