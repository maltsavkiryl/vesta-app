import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { useTimeDataQuery } from "@/features/time/data/time.queries"
import {
  Banner,
  InCardActionButton,
  StatusBadge,
  SurfaceCard,
  Text,
  appLayout,
  appTypography,
  useDesignTokens,
} from "@/ui"
import { formatCurrency } from "@/utils/formatters"

import { weekData } from "../time.data"
import { formatHours, formatSeconds } from "../time.utils"

export function TimeHeader({ status }: { status: "idle" | "working" | "onBreak" }) {
  const tokens = useDesignTokens()
  const isActive = status !== "idle"

  return (
    <View style={styles.header}>
      <Text
        text="Time"
        weight="bold"
        style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
      />
      {isActive ? (
        <StatusBadge
          label={status === "onBreak" ? "On break" : "Working"}
          tone={status === "onBreak" ? "warning" : "success"}
        />
      ) : null}
    </View>
  )
}

export function IdleClockCard({ onClockIn }: { onClockIn: () => void }) {
  const tokens = useDesignTokens()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession

  if (!clockSession) return null

  return (
    <SurfaceCard elevated style={styles.clockCard}>
      <View style={styles.idleCopy}>
        <Text
          text="TODAY'S SHIFT"
          size="xxs"
          weight="semiBold"
          style={[styles.caps, { color: tokens.textMuted }]}
        />
        <Text
          text={`${clockSession.scheduledStart} - ${clockSession.scheduledEnd}`}
          weight="bold"
          style={[styles.shiftTime, { color: tokens.textPrimary }]}
        />
        <Text
          text={`${clockSession.role} · 6h Evening shift`}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <View style={[styles.locationPanel, { backgroundColor: tokens.background }]}>
        <Ionicons color={tokens.textMuted} name="location-outline" size={15} />
        <View style={styles.flex}>
          <Text
            text={clockSession.venueName}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={clockSession.venueAddress}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={15} />
      </View>

      <Banner
        icon={<Ionicons color={tokens.warning} name="flash-outline" size={13} />}
        tone="warning"
      >
        <Text
          text="Clock-in opens at 16:45 · Opens in 2h 21m"
          size="xxs"
          weight="medium"
          style={[styles.flex, { color: tokens.warning }]}
        />
      </Banner>

      <View style={styles.cardAction}>
        <InCardActionButton label="Clock in" onPress={onClockIn} />
      </View>
    </SurfaceCard>
  )
}

export function ActiveClockCard({
  breakSeconds,
  elapsedSeconds,
  earnings,
  onClockOut,
  onEndBreak,
  onStartBreak,
  status,
  totalBreakSeconds,
}: {
  breakSeconds: number
  elapsedSeconds: number
  earnings: string
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
  const progress = Math.min((elapsedSeconds / (6 * 3600)) * 100, 100)
  const toneColor = isOnBreak ? tokens.warning : tokens.success

  return (
    <SurfaceCard elevated style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <Text
          text={isOnBreak ? "Break in progress" : "Current shift"}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${state.clockSession.scheduledStart} - ${state.clockSession.scheduledEnd} · ${state.clockSession.role}`}
          numberOfLines={1}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <View style={[styles.timerPanel, { backgroundColor: tokens.backgroundMuted }]}>
        <Text
          text={formatSeconds(isOnBreak ? breakSeconds : elapsedSeconds)}
          weight="bold"
          style={[styles.activeTimer, { color: isOnBreak ? tokens.warning : tokens.textPrimary }]}
        />
        <Text
          text={isOnBreak ? `${formatSeconds(elapsedSeconds)} worked` : "since 17:00"}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
        <View style={[styles.shiftProgressTrack, { backgroundColor: tokens.surfaceTertiary }]}>
          <View
            style={[
              styles.shiftProgressFill,
              { backgroundColor: toneColor, width: `${progress}%` },
            ]}
          />
        </View>
        <Text
          text={`${Math.round(progress)}% of 6h shift${totalBreakSeconds > 0 ? ` · ${formatHours(totalBreakSeconds)} break` : ""}`}
          size="xxs"
          style={{ color: tokens.textMuted }}
        />
      </View>

      <View style={styles.summaryRows}>
        <SummaryRow color={tokens.success} icon="cash-outline" label="Earnings" value={earnings} />
        <SummaryRow
          color={tokens.accent}
          icon="trending-up-outline"
          label="Hourly rate"
          value={`${formatCurrency(state.earnings.averageHourlyRate)}/h`}
        />
        <SummaryRow
          color={tokens.warning}
          icon="cafe-outline"
          label="Break time"
          value={formatHours(totalBreakSeconds)}
        />
      </View>

      <Banner
        icon={<Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />}
        tone="success"
      >
        <Text
          text={`Location verified · ${state.clockSession.venueName}`}
          size="xxs"
          weight="medium"
          style={[styles.flex, { color: tokens.success }]}
        />
      </Banner>

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
              { backgroundColor: tokens.background, borderColor: tokens.border },
            ]}
          >
            <Ionicons color={tokens.textSecondary} name="cafe-outline" size={16} />
            <Text
              text="Start break"
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary }}
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
    </SurfaceCard>
  )
}

function SummaryRow({
  color,
  icon,
  label,
  value,
}: {
  color: string
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.summaryRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}14` }]}>
        <Ionicons color={color} name={icon} size={16} />
      </View>
      <Text text={label} size="xs" style={[styles.flex, { color: tokens.textSecondary }]} />
      <Text text={value} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

export function WeeklySummary({ weekTotal }: { weekTotal: number }) {
  const tokens = useDesignTokens()
  const target = 30
  const progress = Math.min((weekTotal / target) * 100, 100)

  return (
    <SurfaceCard style={styles.weekCard}>
      <View style={styles.weekHeader}>
        <View>
          <Text
            text="This week"
            size="xs"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${weekTotal.toFixed(1)}h · ${formatCurrency(weekTotal * 12.02)} est.`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <View style={styles.weekTotal}>
          <Text
            text={`${weekTotal.toFixed(1)}h`}
            weight="bold"
            style={[styles.weekTotalValue, { color: tokens.textPrimary }]}
          />
          <Text text="of 30h target" size="xxs" style={{ color: tokens.textMuted }} />
        </View>
      </View>
      <WeekChart todayHours={Math.max(weekTotal - 29.45, 0)} />
      <View style={[styles.progressTrack, { backgroundColor: tokens.background }]}>
        <View
          style={[styles.progressFill, { backgroundColor: tokens.accent, width: `${progress}%` }]}
        />
      </View>
    </SurfaceCard>
  )
}

function WeekChart({ todayHours }: { todayHours: number }) {
  const tokens = useDesignTokens()
  const maxHours = 8

  return (
    <View>
      <View style={styles.weekBars}>
        {weekData.map((item, index) => {
          const hours = item.today ? todayHours : item.hours
          const height = Math.max(Math.min(hours / maxHours, 1) * 48, hours > 0 ? 3 : 0)
          const color = item.today
            ? hours > 0
              ? tokens.accent
              : `${tokens.accent}33`
            : hours > 0
              ? tokens.isDark
                ? "#48484A"
                : "#C7C7CC"
              : tokens.surfaceSecondary

          return (
            <View key={`${item.day}-${index}`} style={styles.weekBarColumn}>
              <View style={[styles.weekBar, { backgroundColor: color, height }]} />
            </View>
          )
        })}
      </View>
      <View style={styles.weekLabels}>
        {weekData.map((item, index) => (
          <Text
            key={`${item.day}-${index}`}
            text={item.day}
            size="xxs"
            weight={item.today ? "semiBold" : "normal"}
            style={[styles.weekLabel, { color: item.today ? tokens.accent : tokens.textMuted }]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  activeCard: {
    borderRadius: 20,
    gap: appLayout.cardGap,
    padding: 16,
  },
  activeHeader: {
    gap: 2,
  },
  activeTimer: {
    fontSize: 34,
    lineHeight: 40,
  },
  breakButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  caps: {
    letterSpacing: 0,
  },
  cardAction: {
    marginTop: 4,
  },
  clockCard: {
    borderRadius: 20,
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  idleCopy: {
    alignItems: "center",
    gap: 4,
  },
  locationPanel: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressFill: {
    borderRadius: 99,
    height: "100%",
  },
  progressTrack: {
    borderRadius: 99,
    height: 3,
    overflow: "hidden",
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
    marginTop: 10,
    overflow: "hidden",
    width: "100%",
  },
  shiftTime: {
    fontSize: 26,
    lineHeight: 31,
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  summaryRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 46,
  },
  summaryRows: {
    gap: 0,
  },
  timerPanel: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  weekBar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    width: "100%",
  },
  weekBarColumn: {
    flex: 1,
    height: 56,
    justifyContent: "flex-end",
  },
  weekBars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 4,
  },
  weekCard: {
    borderRadius: 18,
    gap: 12,
    padding: 16,
  },
  weekHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekLabel: {
    flex: 1,
    fontSize: 10,
    textAlign: "center",
  },
  weekLabels: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  weekTotal: {
    alignItems: "flex-end",
  },
  weekTotalValue: {
    fontSize: 20,
    lineHeight: 24,
  },
})
