import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import { InCardActionButton, Text, appTypography, useDesignTokens } from "@/ui"

import { formatHours, formatSeconds } from "../time.utils"
import { TimeHeroCard } from "./TimeHeroCard"

const HERO_SURFACE_DIVIDER = "rgba(255, 255, 255, 0.10)"

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getShiftDurationHours(start: string, end: string) {
  let minutes = timeToMinutes(end) - timeToMinutes(start)
  if (minutes < 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 10) / 10
}

function formatDurationHoursLabel(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) return `${minutes}m`
  if (minutes === 0) return `${wholeHours}h`
  return `${wholeHours}h ${minutes}m`
}

function getClockInOpenLabel(start: string) {
  const minutes = (timeToMinutes(start) + 24 * 60 - 15) % (24 * 60)
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0")
  const minuteValue = String(minutes % 60).padStart(2, "0")
  return `${hours}:${minuteValue}`
}

function HeroCard({
  children,
  gradientVariant = "compact",
  style,
}: {
  children: ReactNode
  gradientVariant?: "default" | "compact"
  style?: object
}) {
  return (
    <TimeHeroCard contentStyle={styles.heroContent} gradientVariant={gradientVariant} style={style}>
      {children}
    </TimeHeroCard>
  )
}

function HeroMetaPill({
  icon,
  text,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  tone?: "default" | "success" | "warning"
}) {
  const tokens = useDesignTokens()
  const color =
    tone === "success"
      ? tokens.success
      : tone === "warning"
        ? tokens.warning
        : `${tokens.accentForeground}D6`

  return (
    <View style={[styles.heroMetaPill, { backgroundColor: `${tokens.accentForeground}12` }]}>
      <Ionicons color={color} name={icon} size={12} />
      <Text text={text} size="xxs" weight="medium" style={{ color }} />
    </View>
  )
}

function HeroDetailRow({
  icon,
  text,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.heroDetailRow}>
      <Ionicons color={`${tokens.accentForeground}80`} name={icon} size={16} />
      <Text
        numberOfLines={1}
        text={text}
        size="xs"
        style={[styles.flex, { color: `${tokens.accentForeground}C7` }]}
      />
      {trailing}
    </View>
  )
}

export function TimeHeader({ status: _status }: { status: "idle" | "working" | "onBreak" }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.header}>
      <Text
        text="Time"
        weight="bold"
        style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
      />
    </View>
  )
}

export function IdleClockCard({ onClockIn }: { onClockIn: () => void }) {
  const tokens = useDesignTokens()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession

  if (!clockSession) return null

  const durationHours = getShiftDurationHours(
    clockSession.scheduledStart,
    clockSession.scheduledEnd,
  )

  return (
    <HeroCard>
      <View style={styles.heroTopRow}>
        <View style={styles.flex}>
          <Text
            text="TODAY'S SHIFT"
            size="xxs"
            weight="semiBold"
            style={[styles.caps, { color: `${tokens.accentForeground}99` }]}
          />
          <Text
            text={`${clockSession.scheduledStart} - ${clockSession.scheduledEnd}`}
            weight="bold"
            style={[styles.heroShiftTime, { color: tokens.accentForeground }]}
          />
          <Text
            text={`${clockSession.role} · ${formatDurationHoursLabel(durationHours)} planned`}
            size="xs"
            style={{ color: `${tokens.accentForeground}BF` }}
          />
        </View>
        <HeroMetaPill icon="checkmark-circle" text="Confirmed" tone="success" />
      </View>

      <HeroDetailRow
        icon="location-outline"
        text={`${clockSession.venueName} · ${clockSession.venueAddress}`}
        trailing={<Ionicons color={tokens.success} name="navigate-circle-outline" size={18} />}
      />

      <View style={styles.heroDivider} />

      <View style={styles.heroInfoRow}>
        <Ionicons color={tokens.warning} name="flash-outline" size={13} />
        <Text
          text={`Clock-in opens at ${getClockInOpenLabel(clockSession.scheduledStart)}`}
          size="xxs"
          weight="medium"
          style={{ color: tokens.warning }}
        />
      </View>

      <View style={styles.heroFooter}>
        <InCardActionButton label="Clock in" onPress={onClockIn} />
      </View>
    </HeroCard>
  )
}

export function ActiveClockCard({
  breakSeconds,
  elapsedSeconds,
  onClockOut,
  onEndBreak,
  onStartBreak,
  status,
  totalBreakSeconds,
}: {
  breakSeconds: number
  elapsedSeconds: number
  onClockOut: () => void
  onEndBreak: () => void
  onStartBreak: () => void
  status: "working" | "onBreak"
  totalBreakSeconds: number
}) {
  const tokens = useDesignTokens()
  const query = useTimeDataQuery()
  const state = query.data
  const isOnBreak = status === "onBreak"
  if (!state) return null
  const durationHours = getShiftDurationHours(
    state.clockSession.scheduledStart,
    state.clockSession.scheduledEnd,
  )
  const shiftDurationSeconds = durationHours * 3600
  const progress = Math.min((elapsedSeconds / shiftDurationSeconds) * 100, 100)
  const toneColor = isOnBreak ? tokens.warning : tokens.success
  const remainingSeconds = Math.max(shiftDurationSeconds - elapsedSeconds, 0)

  return (
    <HeroCard gradientVariant="compact">
      <View style={styles.heroTopRow}>
        <View style={styles.heroPrimaryStack}>
          <Text
            text={formatSeconds(isOnBreak ? breakSeconds : elapsedSeconds)}
            weight="bold"
            style={[
              styles.heroTimerValue,
              { color: isOnBreak ? tokens.warning : tokens.accentForeground },
            ]}
          />
          <Text
            text={`${state.clockSession.scheduledStart} - ${state.clockSession.scheduledEnd} · ${state.clockSession.role}`}
            numberOfLines={1}
            size="xs"
            style={{ color: `${tokens.accentForeground}BF` }}
          />
        </View>
        <HeroMetaPill
          icon={isOnBreak ? "cafe-outline" : "radio-outline"}
          text={isOnBreak ? "On break" : "Working"}
          tone={isOnBreak ? "warning" : "success"}
        />
      </View>

      <View style={styles.timerPanel}>
        <Text
          text={
            isOnBreak
              ? `${formatSeconds(elapsedSeconds)} worked`
              : `Started at ${formatTimeValue(state.clockSession.startedAt ?? state.clockSession.scheduledStart)}`
          }
          size="xxs"
          weight="medium"
          style={{ color: `${tokens.accentForeground}B3` }}
        />
        <Text
          text={
            isOnBreak
              ? `${formatDurationLabel(totalBreakSeconds)} total break`
              : remainingSeconds > 0
                ? `${formatDurationLabel(remainingSeconds)} remaining`
                : "Shift target reached"
          }
          size="xs"
          weight="semiBold"
          style={{ color: tokens.accentForeground }}
        />
        <View
          style={[styles.shiftProgressTrack, { backgroundColor: `${tokens.accentForeground}14` }]}
        >
          <View
            style={[
              styles.shiftProgressFill,
              { backgroundColor: toneColor, width: `${progress}%` },
            ]}
          />
        </View>
        <Text
          text={`${Math.round(progress)}% of ${formatDurationHoursLabel(durationHours)} shift${totalBreakSeconds > 0 ? ` · ${formatHours(totalBreakSeconds)} paused` : ""}`}
          size="xxs"
          style={{ color: `${tokens.accentForeground}99` }}
        />
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroStatusRow}>
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />
        <Text
          text={`Location verified · ${state.clockSession.venueName}`}
          size="xxs"
          weight="medium"
          style={[styles.flex, { color: tokens.success }]}
        />
        <Text text="On site" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
      </View>

      {isOnBreak ? (
        <Pressable
          onPress={onEndBreak}
          style={[
            styles.breakButton,
            { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}24` },
          ]}
        >
          <Ionicons color={tokens.warning} name="play-outline" size={17} />
          <Text text="End break" size="xs" weight="semiBold" style={{ color: tokens.warning }} />
        </Pressable>
      ) : (
        <View style={styles.actionGrid}>
          <Pressable
            onPress={onStartBreak}
            style={[
              styles.secondaryAction,
              {
                backgroundColor: tokens.isDark
                  ? `${tokens.accentForeground}0D`
                  : `${tokens.accentForeground}10`,
                borderColor: `${tokens.accentForeground}12`,
              },
            ]}
          >
            <Ionicons color={`${tokens.accentForeground}BF`} name="cafe-outline" size={16} />
            <Text
              text="Start break"
              size="xs"
              weight="medium"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
          <Pressable
            onPress={onClockOut}
            style={[
              styles.dangerAction,
              { backgroundColor: `${tokens.danger}10`, borderColor: `${tokens.danger}24` },
            ]}
          >
            <Text text="Clock out" size="xs" weight="semiBold" style={{ color: tokens.danger }} />
          </Pressable>
        </View>
      )}
    </HeroCard>
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  breakButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  caps: {
    letterSpacing: 0,
  },
  dangerAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  heroContent: {
    gap: 16,
    zIndex: 1,
  },
  heroDetailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  heroDivider: {
    backgroundColor: HERO_SURFACE_DIVIDER,
    height: StyleSheet.hairlineWidth,
  },
  heroFooter: {
    marginTop: 2,
  },
  heroInfoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroMetaPill: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroPrimaryStack: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  heroShiftTime: {
    fontSize: 31,
    lineHeight: 36,
    marginTop: 2,
  },
  heroStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  heroTimerValue: {
    fontSize: 35,
    lineHeight: 40,
    marginTop: 2,
  },
  heroTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  secondaryAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  shiftProgressFill: {
    borderRadius: 999,
    height: "100%",
  },
  shiftProgressTrack: {
    borderRadius: 999,
    height: 5,
    overflow: "hidden",
    width: "100%",
  },
  timerPanel: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
    paddingTop: 4,
  },
})
