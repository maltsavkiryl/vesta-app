/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { MyRequests, ShiftChangeRequest, ShiftSwapRequest } from "@/core/models"
import { Pressable } from "react-native"
import {
  ActionRow,
  EmptyState,
  GroupedSection,
  StatusBadge,
  Text,
  useDesignTokens,
} from "@/ui"
import type { AppTone } from "@/ui/composites/appTone"
import { translate } from "@/i18n/translate"

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
      return translate("planning:requests.statusApproved")
    case "rejected":
    case "declined":
      return translate("planning:requests.statusRejected")
    case "cancelled":
      return translate("planning:requests.statusCancelled")
    default:
      return translate("planning:requests.statusPending")
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
      title={translate("planning:requests.newRequest")}
    >
      <View style={styles.shortcutsStack}>
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />}
          onPress={onNewShiftSwap}
          subtitle={translate("planning:requests.swapSubtitle")}
          title={translate("planning:requests.shiftSwap")}
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />}
          onPress={onNewChangeRequest}
          subtitle={translate("planning:requests.changeSubtitle")}
          title={translate("planning:requests.changeRequest")}
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </GroupedSection>
  )
}

// ── Shift swap request row ────────────────────────────────────────────────────

export function PlanningSwapRequestRow({
  myEmployeeId,
  onCancel,
  onDecide,
  request,
}: {
  myEmployeeId?: string
  onCancel?: (swapCode: string) => void
  onDecide?: (swapCode: string, accept: boolean) => void
  request: ShiftSwapRequest
}) {
  const tokens = useDesignTokens()
  const isPending = request.status.toLowerCase() === "pending"
  const isRequester = myEmployeeId !== undefined && request.requesterEmployeeId === myEmployeeId
  const isTarget = myEmployeeId !== undefined && request.targetEmployeeId === myEmployeeId

  return (
    <View style={styles.requestRow}>
      <View style={styles.requestInfo}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text={translate("planning:requests.shiftSwap")}
          weight="medium"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={request.createdAt.slice(0, 10)}
        />
        {isPending && isTarget && onDecide ? (
          <View style={styles.decideRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onDecide(request.id, true)}
              style={({ pressed }) => [styles.actionBtn, styles.actionBtnAccept, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text size="xxs" style={{ color: tokens.success }} text={translate("planning:requests.statusApproved")} weight="semiBold" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onDecide(request.id, false)}
              style={({ pressed }) => [styles.actionBtn, styles.actionBtnReject, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text size="xxs" style={{ color: tokens.danger }} text={translate("planning:requests.statusRejected")} weight="semiBold" />
            </Pressable>
          </View>
        ) : null}
        {isPending && isRequester && onCancel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onCancel(request.id)}
            style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text size="xxs" style={{ color: tokens.textSecondary }} text={translate("planning:requests.statusCancelled")} weight="semiBold" />
          </Pressable>
        ) : null}
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
          text={translate("planning:requests.changeRequest")}
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

export function PlanningRequestsListSection({
  myEmployeeId,
  onCancel,
  onDecide,
  requests,
}: {
  myEmployeeId?: string
  onCancel?: (swapCode: string) => void
  onDecide?: (swapCode: string, accept: boolean) => void
  requests: MyRequests
}) {
  const tokens = useDesignTokens()
  const hasAny = requests.swapRequests.length > 0 || requests.changeRequests.length > 0

  if (!hasAny) {
    return (
      <GroupedSection title={translate("planning:requests.title")}>
        <View style={styles.emptyBody}>
          <Text
            size="xs"
            style={{ color: tokens.textMuted, textAlign: "center" }}
            text={translate("planning:requests.noRequestsSubtitle")}
          />
        </View>
      </GroupedSection>
    )
  }

  return (
    <GroupedSection title={translate("planning:requests.title")}>
      <View style={styles.requestsList}>
        {requests.swapRequests.map((req) => (
          <PlanningSwapRequestRow
            key={req.id}
            myEmployeeId={myEmployeeId}
            onCancel={onCancel}
            onDecide={onDecide}
            request={req}
          />
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
      subtitle={translate("planning:requests.noRequestsSubtitle")}
      title={translate("planning:requests.noRequestsTitle")}
    />
  )
}

const styles = StyleSheet.create({
  actionBtn: {
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  actionBtnAccept: {
    backgroundColor: "transparent",
    borderColor: "#34C75920",
  },
  actionBtnReject: {
    backgroundColor: "transparent",
    borderColor: "#FF3B3020",
  },
  decideRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
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
