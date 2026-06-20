import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LeaveEntitlement } from "@/core/models"
import {
  AppButton,
  EmptyState,
  MetricGrid,
  SurfaceCard,
  useDesignTokens,
} from "@/ui"
import { Text } from "@/ui/primitives/Text"

// ── Leave entitlement card ────────────────────────────────────────────────────

export function PlanningLeaveBalanceCard({ entitlement }: { entitlement: LeaveEntitlement }) {
  const tokens = useDesignTokens()
  const year = entitlement.calendarYear

  return (
    <SurfaceCard style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={`${year} VERLOFRECHTEN`}
          weight="semiBold"
        />
        <Ionicons color={tokens.textMuted} name="leaf-outline" size={16} />
      </View>
      <MetricGrid
        items={[
          { label: "Wettelijk", value: `${entitlement.statutoryDays}d` },
          { label: "Werkgever", value: `${entitlement.employerPolicyDays}d` },
          { label: "Totaal", value: `${entitlement.totalDays}d` },
          { label: "Uren", value: `${entitlement.entitlementHours}u` },
        ]}
      />
      <Text
        size="xxs"
        style={{ color: tokens.textMuted }}
        text="Gesynchroniseerd vanuit salarisadministratie"
      />
    </SurfaceCard>
  )
}

export function PlanningLeaveBalanceEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      cardless
      icon={<Ionicons color={tokens.textMuted} name="leaf-outline" size={18} />}
      subtitle="Je verlofrechten zijn nog niet beschikbaar."
      title="Geen verlofsaldo"
    />
  )
}

// ── New leave request form ────────────────────────────────────────────────────
// Note: POST /employee/planning/leave does not exist in the API contract.
// The leave screen is read-only. This form component is kept as a stub for
// potential future use but is not wired up.

export function PlanningNewLeaveCard({
  createError,
  createSuccess,
  endDate,
  isCreating,
  notes: _notes,
  onDismissSuccess,
  onSubmit,
  setEndDate: _setEndDate,
  setNotes: _setNotes,
  setStartDate: _setStartDate,
  startDate,
}: {
  createError: string | null
  createSuccess: boolean
  endDate: string
  isCreating: boolean
  notes: string
  onDismissSuccess: () => void
  onSubmit: () => void
  setEndDate: (v: string) => void
  setNotes: (v: string) => void
  setStartDate: (v: string) => void
  startDate: string
}) {
  const tokens = useDesignTokens()

  if (createSuccess) {
    return (
      <SurfaceCard style={styles.successCard}>
        <View style={styles.successRow}>
          <Ionicons color={tokens.success} name="checkmark-circle" size={20} />
          <Text
            size="sm"
            style={{ color: tokens.success }}
            text="Aanvraag ingediend!"
            weight="semiBold"
          />
        </View>
        <AppButton label="Nieuwe aanvraag" onPress={onDismissSuccess} variant="secondary" />
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard style={styles.formBody}>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text size="xxs" style={{ color: tokens.textSecondary }} text="BEGINDATUM" weight="semiBold" />
          <Text size="sm" style={{ color: tokens.textPrimary }} text={startDate} weight="medium" />
        </View>
        <View style={styles.dateField}>
          <Text size="xxs" style={{ color: tokens.textSecondary }} text="EINDDATUM" weight="semiBold" />
          <Text size="sm" style={{ color: tokens.textPrimary }} text={endDate} weight="medium" />
        </View>
      </View>

      {createError ? (
        <View style={[styles.errorRow, { backgroundColor: `${tokens.danger}10` }]}>
          <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
          <Text size="xxs" style={{ color: tokens.danger }} text={createError} />
        </View>
      ) : null}

      <AppButton
        disabled={isCreating}
        fullWidth
        label={isCreating ? "Indienen…" : "Verlof aanvragen"}
        onPress={onSubmit}
        pressHaptic="none"
      />
    </SurfaceCard>
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
  dateField: {
    flex: 1,
    gap: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 16,
  },
  errorRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formBody: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  successCard: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  successRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
})
