import { useEffect, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"

import { formatShortDate } from "@/core/date"
import type { PlanningCall } from "@/core/models"
import { translate } from "@/i18n/translate"
import { AppButton, EmptyState, Skeleton, SurfaceCard, useDesignTokens } from "@/ui"
import { useListItemEntrance, useCelebratePulse } from "@/ui/foundations/motion"
import { Text } from "@/ui/primitives/Text"
import { fireHaptic } from "@/utils/haptics"

import type { ClaimState } from "./usePlanningCallsScreen"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PlanningCallCardSkeleton({ index }: { index: number }) {
  const tokens = useDesignTokens()
  const { animatedStyle } = useListItemEntrance(index)
  return (
    <Animated.View style={animatedStyle}>
      <SurfaceCard style={styles.callCard}>
        <View style={styles.skeletonHeader}>
          <Skeleton width={80} height={12} radius={6} />
          <Skeleton width={70} height={24} radius={tokens.radiusFull} />
        </View>
        <Skeleton width={200} height={12} radius={6} />
        <Skeleton width="100%" height={40} radius={tokens.radiusMd} />
      </SurfaceCard>
    </Animated.View>
  )
}

export function PlanningCallsListSkeleton() {
  return (
    <View style={styles.callsList}>
      {[0, 1].map((i) => (
        <PlanningCallCardSkeleton key={i} index={i} />
      ))}
    </View>
  )
}

// ─── Mode badge ───────────────────────────────────────────────────────────────

function getModeLabel(mode: string): string {
  const key = mode.toLowerCase().replace(/[^a-z]/g, "")
  if (key === "opencall" || key === "open") return translate("planning:calls.modeOpenCall")
  if (key === "urgent") return translate("planning:calls.modeUrgent")
  if (key === "fillin" || key === "fill") return translate("planning:calls.modeFillIn")
  return mode
}

function CallModeBadge({ mode }: { mode: string }) {
  const tokens = useDesignTokens()
  const label = getModeLabel(mode)
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[styles.modeBadge, { backgroundColor: tokens.accentMuted }]}
    >
      <Text size="xxs" style={{ color: tokens.accent }} text={label} weight="semiBold" />
    </View>
  )
}

// ─── Call Card ────────────────────────────────────────────────────────────────

export function PlanningCallCard({
  call,
  claimState,
  index = 0,
  onClaim,
}: {
  call: PlanningCall
  claimState: ClaimState
  index?: number
  onClaim: () => void
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 40 })
  const { animatedStyle: pulseStyle, triggerPulse } = useCelebratePulse()

  const isClaiming = claimState === "claiming"
  const isClaimed = claimState === "claimed" || call.status === "claimed"
  const hasError =
    claimState === "error" ||
    claimState === "already-claimed" ||
    claimState === "forbidden" ||
    claimState === "conflict"

  // Informational conflicts (already-claimed, scheduling conflict) use warning tone.
  // Hard errors (forbidden, server error) use danger tone.
  const isWarningError = claimState === "already-claimed" || claimState === "conflict"

  const errorMessage =
    claimState === "already-claimed"
      ? translate("planning:calls.alreadyClaimed")
      : claimState === "forbidden"
        ? translate("planning:calls.forbidden")
        : claimState === "conflict"
          ? translate("planning:calls.conflict")
          : claimState === "error"
            ? translate("planning:calls.claimError")
            : null

  // Fire success feedback only after the claim is confirmed, not optimistically.
  const prevClaimState = useRef<ClaimState>(claimState)
  useEffect(() => {
    if (prevClaimState.current !== "claimed" && claimState === "claimed") {
      fireHaptic("success")
      triggerPulse()
    }
    prevClaimState.current = claimState
  }, [claimState, triggerPulse])

  const handleClaim = () => {
    if (!isClaimed && !isClaiming) {
      onClaim()
    }
  }

  return (
    <Animated.View style={entranceStyle}>
      <Animated.View style={pulseStyle}>
        <SurfaceCard
          elevationLevel={isClaimed ? 0 : 1}
          style={[
            styles.callCard,
            isClaimed && {
              borderColor: tokens.successSoft,
            },
          ]}
        >
          {/* Header row */}
          <View style={styles.callHeader}>
            <View style={styles.callMeta}>
              <Text
                size="xxs"
                style={{ color: tokens.textMuted }}
                text={formatShortDate(call.createdAt.slice(0, 10))}
                weight="medium"
              />
              <CallModeBadge mode={call.mode} />
            </View>
            {isClaimed ? (
              <View
                accessible
                accessibilityLabel={translate("planning:calls.claimed")}
                accessibilityRole="text"
                style={[styles.claimedBadge, { backgroundColor: tokens.successSoft }]}
              >
                {/* Decorative checkmark — hidden from screen readers */}
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Ionicons color={tokens.success} name="checkmark-circle" size={13} />
                </View>
                <Text
                  size="xxs"
                  style={{ color: tokens.success }}
                  text={translate("planning:calls.claimed")}
                  weight="semiBold"
                />
              </View>
            ) : null}
          </View>

          {/* Note */}
          {call.note ? (
            <Text
              size="xs"
              style={{ color: tokens.textSecondary }}
              text={call.note}
              numberOfLines={3}
            />
          ) : null}

          {/* Error callout */}
          {hasError && errorMessage ? (
            <View
              style={[
                styles.errorRow,
                isWarningError
                  ? { backgroundColor: tokens.warningSoft, borderColor: `${tokens.warning}25` }
                  : { backgroundColor: tokens.dangerSoft, borderColor: `${tokens.danger}25` },
              ]}
            >
              <Ionicons
                color={isWarningError ? tokens.warning : tokens.danger}
                name={isWarningError ? "warning-outline" : "alert-circle-outline"}
                size={14}
              />
              <Text
                size="xxs"
                style={{ color: isWarningError ? tokens.warning : tokens.danger }}
                text={errorMessage}
              />
            </View>
          ) : null}

          {/* Claim CTA */}
          {!isClaimed ? (
            <AppButton
              disabled={isClaiming}
              fullWidth
              isLoading={isClaiming}
              label={translate("planning:calls.claim")}
              onPress={handleClaim}
              pressHaptic="none"
            />
          ) : null}
        </SurfaceCard>
      </Animated.View>
    </Animated.View>
  )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

export function PlanningCallsEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      icon={<Ionicons color={tokens.textMuted} name="radio-outline" size={18} />}
      subtitle={translate("planning:calls.noCallsSubtitle")}
      title={translate("planning:calls.noCallsTitle")}
    />
  )
}

const styles = StyleSheet.create({
  callCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  callHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  callMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  callsList: {
    gap: 14,
  },
  claimedBadge: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  errorRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modeBadge: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skeletonHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
