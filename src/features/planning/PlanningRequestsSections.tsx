import Animated from "react-native-reanimated"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Pressable } from "react-native"
import type { MyRequests, ShiftChangeRequest, ShiftSwapRequest } from "@/core/models"
import {
  ActionRow,
  EmptyState,
  GroupedSection,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"
import { MotionView, usePressScale } from "@/ui/composites/app-motion"
import { useListItemEntrance } from "@/ui/foundations/motion"
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
  const { animatedStyle: entrance0 } = useListItemEntrance(0, { baseDelay: 0, step: 50 })
  const { animatedStyle: entrance1 } = useListItemEntrance(1, { baseDelay: 0, step: 50 })

  return (
    <GroupedSection
      bodyStyle={styles.noCardBody}
      title={translate("planning:requests.newRequest")}
    >
      <View style={styles.shortcutsStack}>
        <Animated.View style={entrance0}>
          <ActionRow
            leading={
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.shortcutIcon, { backgroundColor: tokens.accentMuted }]}
              >
                <Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />
              </View>
            }
            onPress={onNewShiftSwap}
            subtitle={translate("planning:requests.swapSubtitle")}
            title={translate("planning:requests.shiftSwap")}
            trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
          />
        </Animated.View>
        <Animated.View style={entrance1}>
          <ActionRow
            leading={
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.shortcutIcon, { backgroundColor: tokens.accentMuted }]}
              >
                <Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />
              </View>
            }
            onPress={onNewChangeRequest}
            subtitle={translate("planning:requests.changeSubtitle")}
            title={translate("planning:requests.changeRequest")}
            trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
          />
        </Animated.View>
      </View>
    </GroupedSection>
  )
}

// ── Decide action button ──────────────────────────────────────────────────────

function DecideButton({
  label,
  onPress,
  tone,
}: {
  label: string
  onPress: () => void
  tone: "accept" | "reject" | "cancel"
}) {
  const tokens = useDesignTokens()
  const { animatedStyle, pressHandlers } = usePressScale({ pressedScale: 0.975 })

  const bgColor =
    tone === "accept"
      ? tokens.successSoft
      : tone === "reject"
        ? tokens.dangerSoft
        : tokens.backgroundMuted
  const textColor =
    tone === "accept"
      ? tokens.success
      : tone === "reject"
        ? tokens.danger
        : tokens.textSecondary
  const borderColor =
    tone === "accept"
      ? tokens.success
      : tone === "reject"
        ? tokens.danger
        : tokens.border

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      {...pressHandlers}
    >
      <Animated.View
        style={[
          styles.decideBtn,
          {
            backgroundColor: bgColor,
            borderColor,
          },
          animatedStyle,
        ]}
      >
        <Text
          size="xxs"
          style={{ color: textColor }}
          text={label}
          weight="semiBold"
        />
      </Animated.View>
    </Pressable>
  )
}

// ── Shift swap request row ────────────────────────────────────────────────────

export function PlanningSwapRequestRow({
  index = 0,
  myEmployeeId,
  onCancel,
  onDecide,
  request,
}: {
  index?: number
  myEmployeeId?: string
  onCancel?: (swapCode: string) => void
  onDecide?: (swapCode: string, accept: boolean) => void
  request: ShiftSwapRequest
}) {
  const tokens = useDesignTokens()
  const { animatedStyle } = useListItemEntrance(index, { baseDelay: 30, step: 50 })
  const isPending = request.status.toLowerCase() === "pending"
  const isRequester = myEmployeeId !== undefined && request.requesterEmployeeId === myEmployeeId
  const isTarget = myEmployeeId !== undefined && request.targetEmployeeId === myEmployeeId

  return (
    <Animated.View style={animatedStyle}>
      <SurfaceCard elevationLevel={1} style={styles.requestCard}>
        <View style={styles.requestCardHeader}>
          <Text
            size="xs"
            style={{ color: tokens.textPrimary }}
            text={translate("planning:requests.shiftSwap")}
            weight="semiBold"
          />
          <StatusBadge
            label={getRequestStatusLabel(request.status)}
            tone={getRequestStatusTone(request.status)}
          />
        </View>
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={request.createdAt.slice(0, 10)}
        />
        {isPending && isTarget && onDecide ? (
          <View style={styles.decideRow}>
            <DecideButton
              label={translate("planning:requests.statusApproved")}
              onPress={() => onDecide(request.id, true)}
              tone="accept"
            />
            <DecideButton
              label={translate("planning:requests.statusRejected")}
              onPress={() => onDecide(request.id, false)}
              tone="reject"
            />
          </View>
        ) : null}
        {isPending && isRequester && onCancel ? (
          <View style={styles.cancelRow}>
            <DecideButton
              label={translate("planning:requests.statusCancelled")}
              onPress={() => onCancel(request.id)}
              tone="cancel"
            />
          </View>
        ) : null}
      </SurfaceCard>
    </Animated.View>
  )
}

// ── Shift change request row ──────────────────────────────────────────────────

export function PlanningChangeRequestRow({
  index = 0,
  request,
}: {
  index?: number
  request: ShiftChangeRequest
}) {
  const tokens = useDesignTokens()
  const { animatedStyle } = useListItemEntrance(index, { baseDelay: 30, step: 50 })

  return (
    <Animated.View style={animatedStyle}>
      <SurfaceCard elevationLevel={1} style={styles.requestCard}>
        <View style={styles.requestCardHeader}>
          <Text
            size="xs"
            style={{ color: tokens.textPrimary }}
            text={translate("planning:requests.changeRequest")}
            weight="semiBold"
          />
          <StatusBadge
            label={getRequestStatusLabel(request.status)}
            tone={getRequestStatusTone(request.status)}
          />
        </View>
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
      </SurfaceCard>
    </Animated.View>
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

  // Compute a global index across both lists for consistent stagger
  let globalIndex = 0

  return (
    <GroupedSection
      bodyStyle={styles.noCardBody}
      title={translate("planning:requests.title")}
    >
      <View style={styles.requestsList}>
        {requests.swapRequests.map((req) => {
          const idx = globalIndex++
          return (
            <PlanningSwapRequestRow
              key={req.id}
              index={idx}
              myEmployeeId={myEmployeeId}
              onCancel={onCancel}
              onDecide={onDecide}
              request={req}
            />
          )
        })}
        {requests.changeRequests.map((req) => {
          const idx = globalIndex++
          return (
            <PlanningChangeRequestRow key={req.id} index={idx} request={req} />
          )
        })}
      </View>
    </GroupedSection>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function PlanningRequestsSkeleton() {
  const tokens = useDesignTokens()
  return (
    <SurfaceCard style={styles.skeletonCard}>
      {[0, 1, 2].map((i) => (
        <MotionView key={i} delay={i * 40}>
          <View
            style={[
              styles.skeletonRow,
              { backgroundColor: tokens.backgroundMuted, borderRadius: tokens.radiusMd },
            ]}
          />
        </MotionView>
      ))}
    </SurfaceCard>
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
  cancelRow: {
    alignItems: "flex-start",
    marginTop: 4,
  },
  decideBtn: {
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10, // increased from 6 to improve touch target height
  },
  decideRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
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
  requestCard: {
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  requestCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  requestsList: {
    gap: 10,
  },
  shortcutIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  shortcutsStack: {
    gap: 10,
  },
  skeletonCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  skeletonRow: {
    height: 56,
    width: "100%",
  },
})
