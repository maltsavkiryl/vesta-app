/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PlanningCall } from "@/core/models"
import { AppButton, EmptyState, SurfaceCard, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"
import type { ClaimState } from "./usePlanningCallsScreen"
import { formatShortDate } from "@/core/date"

export function PlanningCallCard({
  call,
  claimState,
  onClaim,
}: {
  call: PlanningCall
  claimState: ClaimState
  onClaim: () => void
}) {
  const tokens = useDesignTokens()
  const isClaiming = claimState === "claiming"
  const isClaimed = claimState === "claimed" || call.status === "claimed"
  const hasError =
    claimState === "error" || claimState === "already-claimed" || claimState === "forbidden"

  const errorMessage =
    claimState === "already-claimed"
      ? "Deze shift is al geclaimed"
      : claimState === "forbidden"
        ? "Je komt niet in aanmerking voor deze shift"
        : claimState === "error"
          ? "Kon deze shift niet claimen"
          : null

  return (
    <SurfaceCard style={styles.callCard}>
      <View style={styles.callHeader}>
        <View style={styles.callMeta}>
          <Text
            size="xxs"
            style={{ color: tokens.accent }}
            text={formatShortDate(call.createdAt.slice(0, 10))}
            weight="medium"
          />
          <Text
            size="xxs"
            style={{ color: tokens.textMuted }}
            text={call.mode.toUpperCase()}
            weight="semiBold"
          />
        </View>
        {isClaimed ? (
          <View style={[styles.claimedBadge, { backgroundColor: `${tokens.success}18` }]}>
            <Ionicons color={tokens.success} name="checkmark-circle" size={13} />
            <Text size="xxs" style={{ color: tokens.success }} text="Geclaimd" weight="semiBold" />
          </View>
        ) : null}
      </View>

      {call.note ? (
        <Text
          size="xs"
          style={{ color: tokens.textSecondary }}
          text={call.note}
          numberOfLines={3}
        />
      ) : null}

      {hasError && errorMessage ? (
        <View style={[styles.errorRow, { backgroundColor: `${tokens.danger}10` }]}>
          <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
          <Text size="xxs" style={{ color: tokens.danger }} text={errorMessage} />
        </View>
      ) : null}

      {!isClaimed ? (
        <AppButton
          disabled={isClaiming}
          fullWidth
          label={isClaiming ? "Claimen…" : "Claimen"}
          onPress={onClaim}
          pressHaptic="none"
        />
      ) : null}
    </SurfaceCard>
  )
}

export function PlanningCallsEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      icon={<Ionicons color={tokens.textMuted} name="radio-outline" size={18} />}
      subtitle="Er zijn momenteel geen open shifts beschikbaar."
      title="Geen open oproepen"
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
    gap: 6,
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
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
})
