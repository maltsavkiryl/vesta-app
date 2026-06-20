import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { MyRequests, ShiftChangeRequest, ShiftSwapRequest } from "@/core/models"
import {
  ActionRow,
  AppButton as _AppButton,
  EmptyState,
  GroupedSection,
  StatusBadge,
  SurfaceCard as _SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"
import type { AppTone } from "@/ui/composites/appTone"

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRequestStatusTone(status: string): AppTone {
  switch (status.toLowerCase()) {
    case "approved":
    case "accepted":
      return "success"
    case "rejected":
    case "declined":
      return "danger"
    default:
      return "warning"
  }
}

function getRequestStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "approved":
    case "accepted":
      return "Goedgekeurd"
    case "rejected":
    case "declined":
      return "Afgewezen"
    case "cancelled":
      return "Geannuleerd"
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
          subtitle="Meld een conflict of vraag een wijziging aan"
          title="Wijziging aanvragen"
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </GroupedSection>
  )
}

// ── Shift swap request row ────────────────────────────────────────────────────

export function PlanningSwapRequestRow({ request }: { request: ShiftSwapRequest }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.requestRow}>
      <View style={styles.requestInfo}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text="Shift ruilen"
          weight="medium"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={`Aangevraagd op ${request.createdAt.slice(0, 10)}`}
        />
      </View>
      <StatusBadge
        label={getRequestStatusLabel(request.status)}
        tone={getRequestStatusTone(request.status)}
      />
    </View>
  )
}

// ── Shift change request row ──────────────────────────────────────────────────

export function PlanningChangeRequestRow({ request }: { request: ShiftChangeRequest }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.requestRow}>
      <View style={styles.requestInfo}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text="Shift wijziging"
          weight="medium"
        />
        {request.requestedDate ? (
          <Text
            size="xxs"
            style={{ color: tokens.textSecondary }}
            text={request.requestedDate}
          />
        ) : null}
        {request.note ? (
          <Text
            numberOfLines={2}
            size="xxs"
            style={{ color: tokens.textMuted }}
            text={request.note}
          />
        ) : null}
      </View>
      <StatusBadge
        label={getRequestStatusLabel(request.status)}
        tone={getRequestStatusTone(request.status)}
      />
    </View>
  )
}

// ── Combined requests section ─────────────────────────────────────────────────

export function PlanningRequestsListSection({ requests }: { requests: MyRequests }) {
  const tokens = useDesignTokens()
  const hasAny = requests.swapRequests.length > 0 || requests.changeRequests.length > 0

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
        {requests.swapRequests.map((req) => (
          <PlanningSwapRequestRow key={req.id} request={req} />
        ))}
        {requests.changeRequests.map((req) => (
          <PlanningChangeRequestRow key={req.id} request={req} />
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
