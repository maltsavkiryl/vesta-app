import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { translate } from "@/i18n/translate"
import { ProgressBar, Text, useDesignTokens } from "@/ui"

import { formatSeconds } from "../time.utils"
import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { getShiftDurationHours } from "./timeOverview.utils"

type ClockSession = TimeOverviewCardController["state"]["clockSession"]

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
        text={translate("time:activeCard.checkedInAt", { location: liveLocationLabel })}
        size="xxs"
        weight="medium"
        style={[styles.flex, { color: tokens.success }]}
      />
    </View>
  )
}
