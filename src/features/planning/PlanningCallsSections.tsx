import Animated from "react-native-reanimated"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PlanningCall } from "@/core/models"
import { AppButton, EmptyState, Skeleton, SurfaceCard, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"
import type { ClaimState } from "./usePlanningCallsScreen"
import { formatShortDate } from "@/core/date"
import { useListItemEntrance, useCelebratePulse } from "@/ui/foundations/motion"
import { fireHaptic } from "@/utils/haptics"

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

function CallModeBadge({ mode }: { mode: string }) {
  const tokens = useDesignTokens()
  return (
    <View style={[styles.modeBadge, { backgroundColor: tokens.accentMuted }]}>
      <Text
        size="xxs"
        style={{ color: tokens.accent }}
        text={mode.toUpperCase()}
        weight="semiBold"
      />
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

  const handleClaim = () => {
    // Signature moment: haptic + spring pulse, fired optimistically
    if (!isClaimed && !isClaiming) {
      fireHaptic("success")
      triggerPulse()
    }
    onClaim()
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
              <View style={[styles.claimedBadge, { backgroundColor: tokens.successSoft }]}>
                <Ionicons color={tokens.success} name="checkmark-circle" size={13} />
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
            <View style={[styles.errorRow, { backgroundColor: tokens.dangerSoft, borderColor: `${tokens.danger}25` }]}>
              <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
              <Text size="xxs" style={{ color: tokens.danger }} text={errorMessage} />
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
