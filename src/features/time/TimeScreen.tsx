/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"

import { Text } from "@/components/Text"
import { getClockSnapshot } from "@/core/date"
import type { TimeEntry } from "@/core/models"
import {
  AppButton,
  NativeSheetHeader,
  AppScrollScreen,
  StatusBadge,
  SurfaceCard,
  SectionTitle,
} from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"
import { formatCurrency } from "@/utils/formatters"

const weekData = [
  { day: "M", hours: 6 },
  { day: "T", hours: 5.5 },
  { day: "W", hours: 6.2 },
  { day: "T", hours: 0 },
  { day: "F", hours: 5.75 },
  { day: "S", hours: 6 },
  { day: "S", hours: 0, today: true },
]

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(seconds, 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60
  return [hours, minutes, remainingSeconds].map((part) => String(part).padStart(2, "0")).join(":")
}

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

function Header({ status }: { status: "idle" | "working" | "onBreak" }) {
  const tokens = useDesignTokens()
  const isActive = status !== "idle"

  return (
    <View style={styles.header}>
      <Text text="Time" weight="bold" style={[styles.headerTitle, { color: tokens.textPrimary }]} />
      {isActive ? (
        <StatusBadge
          label={status === "onBreak" ? "On break" : "Working"}
          tone={status === "onBreak" ? "warning" : "success"}
        />
      ) : null}
    </View>
  )
}

function IdleClockCard({ onClockIn }: { onClockIn: () => void }) {
  const tokens = useDesignTokens()
  const { state } = useAppSession()

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
          text={`${state.clockSession.scheduledStart} - ${state.clockSession.scheduledEnd}`}
          weight="bold"
          style={[styles.shiftTime, { color: tokens.textPrimary }]}
        />
        <Text
          text={`${state.clockSession.role} · 6h Evening shift`}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <View style={[styles.locationPanel, { backgroundColor: tokens.background }]}>
        <Ionicons color={tokens.textMuted} name="location-outline" size={15} />
        <View style={styles.flex}>
          <Text
            text={state.clockSession.venueName}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={state.clockSession.venueAddress}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={15} />
      </View>

      <View
        style={[
          styles.openNotice,
          { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}22` },
        ]}
      >
        <Ionicons color={tokens.warning} name="flash-outline" size={13} />
        <Text
          text="Clock-in opens at 16:45 · Opens in 2h 21m"
          size="xxs"
          weight="medium"
          style={[styles.flex, { color: tokens.warning }]}
        />
      </View>

      <AppButton label="Clock in" onPress={onClockIn} />
    </SurfaceCard>
  )
}

function ActiveClockCard({
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
  const { state } = useAppSession()
  const isOnBreak = status === "onBreak"
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

      <View
        style={[
          styles.verified,
          { backgroundColor: `${tokens.success}10`, borderColor: `${tokens.success}22` },
        ]}
      >
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />
        <Text
          text={`Location verified · ${state.clockSession.venueName}`}
          size="xxs"
          weight="medium"
          style={[styles.flex, { color: tokens.success }]}
        />
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

function WeeklySummary({ weekTotal }: { weekTotal: number }) {
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
          <Text text="of 30h target" size="xxs" style={{ color: tokens.textMuted, fontSize: 11 }} />
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

function EntryRow({
  entry,
  expanded,
  onPress,
  showEarnings,
}: {
  entry: TimeEntry
  expanded: boolean
  onPress: () => void
  showEarnings?: boolean
}) {
  const tokens = useDesignTokens()
  const date = new Date(entry.date)
  const weekday = format(date, "EEE")
  const day = format(date, "d")

  return (
    <View style={{ borderBottomColor: tokens.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
      <Pressable onPress={onPress} style={styles.entryButton}>
        <View style={styles.entryDate}>
          <Text text={weekday} size="xxs" style={{ color: tokens.textMuted, fontSize: 10 }} />
          <Text
            text={day}
            weight="semiBold"
            style={[styles.entryDay, { color: tokens.textPrimary }]}
          />
        </View>
        <View style={[styles.entryDivider, { backgroundColor: tokens.border }]} />
        <View style={styles.flex}>
          <Text
            text={`${entry.clockIn} - ${entry.clockOut}`}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${entry.shiftLabel} · ${entry.totalHoursLabel}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <View style={styles.entryStatus}>
          <Text
            text={
              showEarnings
                ? entry.earningsLabel
                : entry.status === "approved"
                  ? "Approved"
                  : "Review"
            }
            size="xxs"
            weight="semiBold"
            style={{
              color: showEarnings
                ? tokens.textPrimary
                : entry.status === "approved"
                  ? tokens.success
                  : tokens.warning,
            }}
          />
          <Ionicons
            color={tokens.textMuted}
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.entryDetails}>
          <View style={styles.detailGrid}>
            <DetailCell label="In" value={entry.clockIn} />
            <DetailCell label="Out" value={entry.clockOut} />
            <DetailCell label="Break" value={`${entry.breakMinutes}m`} />
            <DetailCell label="Total" value={entry.totalHoursLabel} />
          </View>
          <View style={[styles.earningsRow, { backgroundColor: `${tokens.success}10` }]}>
            <Text text="Estimated earnings" size="xxs" style={{ color: tokens.textSecondary }} />
            <Text
              text={entry.earningsLabel}
              size="xs"
              weight="bold"
              style={{ color: tokens.success }}
            />
          </View>
        </View>
      ) : null}
    </View>
  )
}

function DetailCell({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.detailCell, { backgroundColor: tokens.background }]}>
      <Text text={label} size="xxs" style={{ color: tokens.textMuted, fontSize: 10 }} />
      <Text text={value} size="xxs" weight="semiBold" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

function RecentEntries({
  entries,
  expandedId,
  onEntryPress,
  onViewAll,
}: {
  entries: TimeEntry[]
  expandedId: string | null
  onEntryPress: (entry: TimeEntry) => void
  onViewAll: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View>
      <SectionTitle
        actionIcon={
          <Ionicons color={tokens.textSecondary} name="chevron-forward-outline" size={13} />
        }
        actionLabel="View all"
        onAction={onViewAll}
        title="Recent entries"
        titleSize="sm"
      />
      <View style={[styles.entriesCard, { backgroundColor: tokens.surface }]}>
        {entries.slice(0, 4).map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            expanded={expandedId === entry.id}
            onPress={() => onEntryPress(entry)}
          />
        ))}
      </View>
    </View>
  )
}

function EntriesDrawer({
  entries,
  expandedId,
  onClose,
  onEntryPress,
  visible,
}: {
  entries: TimeEntry[]
  expandedId: string | null
  onClose: () => void
  onEntryPress: (entry: TimeEntry) => void
  visible: boolean
}) {
  const tokens = useDesignTokens()
  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
      const month = format(new Date(entry.date), "MMMM yyyy")
      acc[month] = [...(acc[month] ?? []), entry]
      return acc
    }, {})
  }, [entries])

  return (
    <Modal
      allowSwipeDismissal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.nativeSheet, { backgroundColor: tokens.background }]}>
        <NativeSheetHeader
          onClose={onClose}
          subtitle={`${entries.length} entries total`}
          title="Time entries"
        />
        <ScrollView
          contentContainerStyle={styles.nativeSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <View key={month} style={styles.monthGroup}>
              <View style={styles.monthHeader}>
                <Text
                  text={month}
                  size="xxs"
                  weight="semiBold"
                  style={{ color: tokens.textSecondary }}
                />
                <Text
                  text={`${monthEntries.length} shifts`}
                  size="xxs"
                  style={{ color: tokens.textMuted }}
                />
              </View>
              <View style={[styles.entriesCard, { backgroundColor: tokens.surface }]}>
                {monthEntries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedId === entry.id}
                    onPress={() => onEntryPress(entry)}
                    showEarnings
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

export function TimeScreen() {
  const router = useRouter()
  const { endBreak, startBreak, startClock, state } = useAppSession()
  const [now, setNow] = useState(() => new Date())
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [showAllEntries, setShowAllEntries] = useState(false)

  useEffect(() => {
    if (state.clockSession.state === "idle") return
    const intervalId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [state.clockSession.state])

  const snapshot = getClockSnapshot(state.clockSession, now)
  const elapsedSeconds = state.clockSession.startedAt
    ? Math.max(
        Math.floor((now.getTime() - new Date(state.clockSession.startedAt).getTime()) / 1000),
        0,
      )
    : 0
  const payableSeconds = snapshot.payableSeconds
  const earnings = formatCurrency((payableSeconds / 3600) * state.earnings.averageHourlyRate)
  const totalBreakSeconds = snapshot.breakSeconds
  const weekTotal =
    weekData.filter((item) => !item.today).reduce((sum, item) => sum + item.hours, 0) +
    elapsedSeconds / 3600

  const handleEntryPress = useCallback((entry: TimeEntry) => {
    setExpandedEntryId((current) => (current === entry.id ? null : entry.id))
  }, [])

  const openClockOut = useCallback(() => router.push("/(app)/clock-out" as never), [router])

  return (
    <>
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <Header status={state.clockSession.state} />

        {state.clockSession.state === "idle" ? (
          <IdleClockCard onClockIn={startClock} />
        ) : (
          <ActiveClockCard
            breakSeconds={state.clockSession.state === "onBreak" ? snapshot.breakSeconds : 0}
            elapsedSeconds={elapsedSeconds}
            earnings={earnings}
            status={state.clockSession.state}
            totalBreakSeconds={totalBreakSeconds}
            onClockOut={openClockOut}
            onEndBreak={endBreak}
            onStartBreak={startBreak}
          />
        )}

        <WeeklySummary weekTotal={weekTotal} />

        <RecentEntries
          entries={state.timeEntries}
          expandedId={expandedEntryId}
          onEntryPress={handleEntryPress}
          onViewAll={() => setShowAllEntries(true)}
        />
      </AppScrollScreen>

      <EntriesDrawer
        entries={state.timeEntries}
        expandedId={expandedEntryId}
        visible={showAllEntries}
        onClose={() => setShowAllEntries(false)}
        onEntryPress={handleEntryPress}
      />
    </>
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  activeCard: {
    gap: 14,
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
  clockCard: {
    borderRadius: 8,
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
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
  detailCell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    flex: 1,
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  detailGrid: {
    flexDirection: "row",
    gap: 6,
  },
  earningsRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  entriesCard: {
    borderCurve: "continuous",
    borderRadius: 8,
    overflow: "hidden",
  },
  entryButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  entryDate: {
    alignItems: "center",
    width: 36,
  },
  entryDay: {
    fontSize: 18,
    lineHeight: 21,
  },
  entryDetails: {
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  entryDivider: {
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  entryStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  idleCopy: {
    alignItems: "center",
    gap: 4,
  },
  locationPanel: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingLeft: 2,
  },
  nativeSheet: {
    flex: 1,
  },
  nativeSheetContent: {
    gap: 16,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  openNotice: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  screen: {
    gap: 12,
    paddingHorizontal: 16,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  verified: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weekBar: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
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
    borderRadius: 8,
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
