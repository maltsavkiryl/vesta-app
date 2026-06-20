import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LeaveRequest, LeaveRequestStatus, RequestItem, RequestStatus } from "@/core/models"
import {
  ActionRow,
  AppButton,
  EmptyState,
  GroupedSection,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"
import type { AppTone } from "@/ui/composites/appTone"

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function getRequestStatusTone(status: RequestStatus): AppTone {
  switch (status) {
    case "approved":
      return "success"
    case "denied":
      return "danger"
    default:
      return "warning"
  }
}

function getRequestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case "approved":
      return "Goedgekeurd"
    case "denied":
      return "Afgewezen"
    default:
      return "In behandeling"
  }
}

// ── Quick-action shortcuts ────────────────────────────────────────────────────

export function PlanningRequestShortcuts({
  onNewChangeRequest,
  onNewShiftSwap,
}: {
  onNewChangeRequest: () => void
  onNewShiftSwap: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection
      bodyStyle={styles.noCardBody}
      title="Nieuwe aanvraag"
    >
      <View style={styles.shortcutsStack}>
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />}
          onPress={onNewShiftSwap}
          subtitle="Vraag een collega om je shift over te nemen"
          title="Shift ruilen"
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />}
          onPress={onNewChangeRequest}
          subtitle="Meld een conflict of vraag verlof aan"
          title="Wijziging aanvragen"
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </GroupedSection>
  )
}

// ── Leave requests ────────────────────────────────────────────────────────────

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
        {request.decisionNotes ? (
          <Text
            numberOfLines={2}
            size="xxs"
            style={{ color: tokens.textMuted }}
            text={request.decisionNotes}
          />
        ) : null}
      </View>
      <StatusBadge
        label={getLeaveStatusLabel(request.status)}
        tone={getLeaveStatusTone(request.status)}
      />
    </View>
  )
}

// ── Schedule requests (shift swap / change) ───────────────────────────────────

export function PlanningScheduleRequestRow({ request }: { request: RequestItem }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.requestRow}>
      <View style={styles.requestInfo}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text={request.type}
          weight="medium"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={request.target.label}
        />
      </View>
      <StatusBadge
        label={getRequestStatusLabel(request.status)}
        tone={getRequestStatusTone(request.status)}
      />
    </View>
  )
}

// ── Combined requests section ─────────────────────────────────────────────────

export function PlanningRequestsListSection({
  leaveRequests,
  scheduleRequests,
}: {
  leaveRequests: LeaveRequest[]
  scheduleRequests: RequestItem[]
}) {
  const tokens = useDesignTokens()
  const hasAny = leaveRequests.length > 0 || scheduleRequests.length > 0

  if (!hasAny) {
    return (
      <GroupedSection title="Mijn aanvragen">
        <View style={styles.emptyBody}>
          <Text
            size="xs"
            style={{ color: tokens.textMuted, textAlign: "center" }}
            text="Nog geen ingediende aanvragen."
          />
        </View>
      </GroupedSection>
    )
  }

  return (
    <GroupedSection title="Mijn aanvragen">
      <View style={styles.requestsList}>
        {leaveRequests.map((req) => (
          <PlanningLeaveRequestRow key={req.id} request={req} />
        ))}
        {scheduleRequests.map((req) => (
          <PlanningScheduleRequestRow key={req.id} request={req} />
        ))}
      </View>
    </GroupedSection>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function PlanningRequestsEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      cardless
      icon={<Ionicons color={tokens.textMuted} name="document-text-outline" size={18} />}
      subtitle="Ingediende aanvragen verschijnen hier."
      title="Nog geen aanvragen"
    />
  )
}

const styles = StyleSheet.create({
  emptyBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  noCardBody: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    overflow: "visible" as const,
    padding: 0,
    shadowOpacity: 0,
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
  shortcutsStack: {
    gap: 10,
  },
})
