import { useEffect } from "react"
import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { formatCurrency } from "@/core/format"
import { ProgressBar, Text, useDesignTokens } from "@/ui"
import { useAppMotion } from "@/providers/motion-provider"

import { formatSeconds } from "../time.utils"
import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { getShiftDurationHours } from "./timeOverview.utils"

type ClockSession = TimeOverviewCardController["state"]["clockSession"]

/**
 * Live, per-second earnings accruing during an active shift. Accrual is driven
 * by `payableSeconds` (worked minus breaks), so it naturally pauses on break.
 * Gives a tasteful count-up pulse each tick unless reduced motion is on.
 */
export function EarningsTicker({
  earnings,
  hourlyRate,
  isOnBreak,
}: {
  earnings: number
  hourlyRate: number
  isOnBreak: boolean
}) {
  const motion = useAppMotion()
  const pulse = useSharedValue(1)
  const formatted = formatCurrency(earnings)

  useEffect(() => {
    if (motion.shouldReduceMotion || isOnBreak) return
    pulse.value = withSequence(
      withTiming(1.035, { duration: 120 }),
      withTiming(1, { duration: 220 }),
    )
  }, [formatted, isOnBreak, motion.shouldReduceMotion, pulse])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))
  const label = isOnBreak
    ? `Paused · ${formatted} earned so far`
    : `Earning ${formatted} · ${formatCurrency(hourlyRate)}/hr`

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={
        isOnBreak
          ? `Earnings paused. ${formatted} earned so far this shift.`
          : `Earning ${formatted} so far this shift, at ${formatCurrency(hourlyRate)} per hour.`
      }
      style={[styles.earningsTickerRow, animatedStyle]}
    >
      <Ionicons
        color={isOnBreak ? timeHeroColors.secondaryText : timeHeroColors.successText}
        name="cash-outline"
        size={14}
      />
      <Text
        text={label}
        size="xs"
        weight="semiBold"
        style={{ color: isOnBreak ? timeHeroColors.secondaryText : timeHeroColors.successText }}
      />
    </Animated.View>
  )
}

export function ActiveCardMetrics({
  clockSession,
  isOnBreak,
  payableSeconds,
  totalBreakSeconds,
}: {
  clockSession: ClockSession
  isOnBreak: boolean
  payableSeconds: number
  totalBreakSeconds: number
}) {
  const tokens = useDesignTokens()
  const isShiftSession =
    clockSession.source === "shift" &&
    Boolean(clockSession.scheduledStart && clockSession.scheduledEnd)
  const durationHours =
    isShiftSession && clockSession.scheduledStart && clockSession.scheduledEnd
      ? getShiftDurationHours(clockSession.scheduledStart, clockSession.scheduledEnd)
      : 0
  const shiftDurationSeconds = durationHours * 3600
  // Progress and "remaining" are measured against payable (worked-minus-break)
  // time, matching what actually counts toward the scheduled shift and pay.
  const progress =
    shiftDurationSeconds > 0 ? Math.min((payableSeconds / shiftDurationSeconds) * 100, 100) : 0
  const toneColor = isOnBreak ? tokens.warning : tokens.success
  const remainingSeconds = Math.max(shiftDurationSeconds - payableSeconds, 0)

  return (
    <View style={styles.timerPanel}>
      <Text
        text={
          isOnBreak
            ? `${formatSeconds(payableSeconds)} worked`
            : `Started at ${formatTimeValue(
                clockSession.startedAt ?? clockSession.scheduledStart ?? new Date(),
              )}`
        }
        size="xxs"
        weight="medium"
        style={{ color: timeHeroColors.secondaryText }}
      />
      <Text
        text={
          isOnBreak
            ? `${formatDurationLabel(totalBreakSeconds)} total break`
            : isShiftSession && remainingSeconds > 0
              ? `${formatDurationLabel(remainingSeconds)} of payable time remaining`
              : isShiftSession
                ? "Shift target reached"
                : `Tracking time at ${clockSession.venueName}`
        }
        size="xs"
        weight="semiBold"
        style={{ color: timeHeroColors.primaryText }}
      />
      {isShiftSession ? (
        <ProgressBar
          fillColor={toneColor}
          progress={progress}
          thickness={5}
          trackColor={tokens.border}
        />
      ) : null}
    </View>
  )
}

export function ActiveCardLocation({ clockSession }: { clockSession: ClockSession }) {
  const tokens = useDesignTokens()
  const liveLocationLabel = clockSession.clockInLocation?.addressLabel ?? clockSession.venueAddress

  return (
    <View style={styles.heroStatusRow}>
      <Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />
      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        text={`Checked in at ${liveLocationLabel}`}
        size="xxs"
        weight="medium"
        style={[styles.flex, { color: tokens.success }]}
      />
    </View>
  )
}
