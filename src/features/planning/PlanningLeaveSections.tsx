import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LeaveBalance, LeaveRequest, LeaveRequestStatus } from "@/core/models"
import {
  AppButton,
  EmptyState,
  GroupedSection,
  MetricGrid,
  StatusBadge,
  SurfaceCard,
  useDesignTokens,
} from "@/ui"
import { Text } from "@/ui/primitives/Text"
import type { AppTone } from "@/ui/composites/appTone"

// ── Leave balance card ────────────────────────────────────────────────────────

export function PlanningLeaveBalanceCard({ balance }: { balance: LeaveBalance }) {
  const tokens = useDesignTokens()
  const year = balance.calendarYear

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
          { label: "Wettelijk", value: `${balance.statutoryDays}d` },
          { label: "Werkgever", value: `${balance.employerPolicyDays}d` },
          { label: "Totaal", value: `${balance.totalDays}d` },
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

// ── Leave requests list ───────────────────────────────────────────────────────

function getLeaveStatusTone(status: LeaveRequestStatus): AppTone {
  switch (status) {
    case "approved":
      return "success"
    case "rejected":
      return "danger"
    case "submitted":
      return "warning"
    default:
      return "neutral"
  }
}

function getLeaveStatusLabel(status: LeaveRequestStatus): string {
  switch (status) {
    case "approved":
      return "Goedgekeurd"
    case "rejected":
      return "Afgewezen"
    case "submitted":
      return "In behandeling"
    case "cancelled":
      return "Geannuleerd"
    default:
      return status
  }
}

export function PlanningLeaveRequestRow({ request }: { request: LeaveRequest }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.requestRow}>
      <View style={styles.requestInfo}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text={request.leaveTypeName ?? "Verlof"}
          weight="medium"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={`${request.startDate} – ${request.endDate}`}
        />
      </View>
      <StatusBadge
        label={getLeaveStatusLabel(request.status)}
        tone={getLeaveStatusTone(request.status)}
      />
    </View>
  )
}

export function PlanningLeaveRequestsSection({ requests }: { requests: LeaveRequest[] }) {
  const tokens = useDesignTokens()

  if (requests.length === 0) {
    return (
      <GroupedSection title="Ingediende aanvragen">
        <View style={styles.emptyRequests}>
          <Text
            size="xs"
            style={{ color: tokens.textMuted, textAlign: "center" }}
            text="Nog geen verlofaanvragen."
          />
        </View>
      </GroupedSection>
    )
  }

  return (
    <GroupedSection title="Ingediende aanvragen">
      <View style={styles.requestsList}>
        {requests.map((req) => (
          <PlanningLeaveRequestRow key={req.id} request={req} />
        ))}
      </View>
    </GroupedSection>
  )
}

// ── New leave request form ────────────────────────────────────────────────────

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
    <GroupedSection title="Verlof aanvragen">
      <View style={styles.formBody}>
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
      </View>
    </GroupedSection>
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
  emptyRequests: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  requestInfo: {
    flex: 1,
    gap: 2,
  },
  requestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  requestsList: {
    gap: 0,
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
