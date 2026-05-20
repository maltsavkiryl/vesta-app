import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { ProgressBar, Text, useDesignTokens } from "@/ui"

import { formatSeconds } from "../time.utils"
import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { getShiftDurationHours } from "./timeOverview.utils"

type ClockSession = TimeOverviewCardController["state"]["clockSession"]

export function ActiveCardMetrics({
  clockSession,
  elapsedSeconds,
  isOnBreak,
  totalBreakSeconds,
}: {
  clockSession: ClockSession
  elapsedSeconds: number
  isOnBreak: boolean
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
  const progress =
    shiftDurationSeconds > 0 ? Math.min((elapsedSeconds / shiftDurationSeconds) * 100, 100) : 0
  const toneColor = isOnBreak ? tokens.warning : tokens.success
  const remainingSeconds = Math.max(shiftDurationSeconds - elapsedSeconds, 0)

  return (
    <View style={styles.timerPanel}>
      <Text
        text={
          isOnBreak
            ? `${formatSeconds(elapsedSeconds)} worked`
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
              ? `${formatDurationLabel(remainingSeconds)} remaining`
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
