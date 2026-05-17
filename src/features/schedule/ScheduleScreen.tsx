import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import SegmentedControl from "@react-native-segmented-control/segmented-control"

import { Text } from "@/components/Text"
import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { AvailabilityDay, AvailabilityStatus, RequestItem, Shift } from "@/core/models"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  MetricGrid,
  PageHeader,
  Pill,
  SurfaceCard,
} from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

type Segment = "shifts" | "availability" | "requests"

const segmentLabels: Record<Segment, string> = {
  shifts: "Shifts",
  availability: "Availability",
  requests: "Requests",
}

const availabilityCopy: Record<
  AvailabilityStatus,
  {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    tone: "accent" | "success" | "neutral"
  }
> = {
  available: {
    icon: "checkmark-circle-outline",
    label: "Available",
    tone: "success",
  },
  preferred: {
    icon: "star-outline",
    label: "Preferred",
    tone: "accent",
  },
  unavailable: {
    icon: "remove-circle-outline",
    label: "Unavailable",
    tone: "neutral",
  },
}

function getRequestTone(status: RequestItem["status"]) {
  return status === "approved" ? "success" : status === "denied" ? "danger" : "warning"
}

function NativeSegmentControl({
  selected,
  onSelect,
}: {
  selected: Segment
  onSelect: (segment: Segment) => void
}) {
  const tokens = useDesignTokens()
  const segments = Object.keys(segmentLabels) as Segment[]
  const selectedIndex = Math.max(segments.indexOf(selected), 0)
  const fontStyle = useMemo(
    () => ({
      color: tokens.textSecondary,
      fontSize: 13,
      fontWeight: "500" as const,
    }),
    [tokens.textSecondary],
  )
  const activeFontStyle = useMemo(
    () => ({
      color: tokens.textPrimary,
      fontSize: 13,
      fontWeight: "600" as const,
    }),
    [tokens.textPrimary],
  )
  return (
    <SegmentedControl
      appearance={tokens.isDark ? "dark" : "light"}
      fontStyle={fontStyle}
      selectedIndex={selectedIndex}
      style={styles.nativeSegmentControl}
      tintColor={tokens.surface}
      values={segments.map((segment) => segmentLabels[segment])}
      activeFontStyle={activeFontStyle}
      onChange={(event) => {
        const nextSegment = segments[event.nativeEvent.selectedSegmentIndex]
        if (nextSegment) onSelect(nextSegment)
      }}
    />
  )
}

function SummaryCard({
  selectedDate,
  selectedShiftCount,
  totalRequestCount,
  weeklyAvailabilityCount,
}: {
  selectedDate: string
  selectedShiftCount: number
  totalRequestCount: number
  weeklyAvailabilityCount: number
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection title={formatFullDate(selectedDate)}>
      <View style={styles.summaryBody}>
        <View style={styles.summaryHeader}>
          <View style={styles.flex}>
            <Text
              text={`${selectedShiftCount} shift${selectedShiftCount === 1 ? "" : "s"} scheduled`}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text text="Weekly overview" size="xxs" style={{ color: tokens.textSecondary }} />
          </View>
          <Ionicons color={tokens.textMuted} name="calendar-outline" size={20} />
        </View>
        <MetricGrid
          items={[
            { label: "Available", value: `${weeklyAvailabilityCount}d` },
            { label: "Requests", value: String(totalRequestCount) },
            { label: "This week", value: "23.5h" },
          ]}
        />
      </View>
    </GroupedSection>
  )
}

function DateStrip({
  dates,
  selectedDate,
  shiftsByDate,
  onSelectDate,
}: {
  dates: string[]
  selectedDate: string
  shiftsByDate: Map<string, Shift[]>
  onSelectDate: (date: string) => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.dateStrip}>
      {dates.map((date) => {
        const active = selectedDate === date
        const shiftCount = shiftsByDate.get(date)?.length ?? 0
        const dayNumber = new Date(date).getDate()
        const dayLabel = new Date(date).toLocaleDateString("en", { weekday: "short" })

        return (
          <Pressable
            key={date}
            onPress={() => onSelectDate(date)}
            style={[
              styles.dateButton,
              {
                backgroundColor: active ? tokens.accent : tokens.surface,
                borderColor: active ? tokens.accent : tokens.border,
              },
            ]}
          >
            <Text
              text={dayLabel}
              size="xxs"
              weight="medium"
              style={{ color: active ? tokens.accentForeground : tokens.textMuted }}
            />
            <Text
              text={String(dayNumber)}
              size="sm"
              weight="semiBold"
              style={{ color: active ? tokens.accentForeground : tokens.textPrimary }}
            />
            <View
              style={[
                styles.shiftDot,
                {
                  backgroundColor:
                    shiftCount > 0
                      ? active
                        ? tokens.accentForeground
                        : tokens.accent
                      : tokens.transparent,
                },
              ]}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

function ShiftRow({ shift, onPress }: { shift: Shift; onPress: () => void }) {
  const tokens = useDesignTokens()
  const statusColor = {
    changed: tokens.warning,
    confirmed: tokens.success,
    pending: tokens.textMuted,
  }[shift.status]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.shiftPressable,
        { opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
    >
      <SurfaceCard style={styles.shiftCard}>
        <View style={[styles.shiftDate, { backgroundColor: tokens.backgroundMuted }]}>
          <Text
            text={shift.dayLabel}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textMuted }}
          />
          <Text
            text={formatShortDate(shift.date).replace("May ", "")}
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
        </View>
        <View style={styles.shiftBody}>
          <View style={styles.shiftPrimaryRow}>
            <Text
              text={getShiftTimeRange(shift)}
              numberOfLines={1}
              size="xs"
              weight="semiBold"
              style={[styles.shiftTime, { color: tokens.textPrimary }]}
            />
            <View style={styles.shiftTrailing}>
              <View style={styles.shiftStatus}>
                <View style={[styles.shiftStatusDot, { backgroundColor: statusColor }]} />
                <Text
                  text={shift.status}
                  numberOfLines={1}
                  size="xxs"
                  weight="medium"
                  style={{ color: statusColor }}
                />
              </View>
              <Ionicons color={tokens.textMuted} name="chevron-forward" size={17} />
            </View>
          </View>
          <Text
            text={`${shift.role} - ${shift.venueName}`}
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
          <View style={styles.shiftFooter}>
            <Ionicons color={tokens.textMuted} name="location-outline" size={13} />
            <Text
              text={shift.venueAddress}
              numberOfLines={1}
              size="xxs"
              style={[styles.flex, { color: tokens.textMuted }]}
            />
          </View>
        </View>
      </SurfaceCard>
    </Pressable>
  )
}

function EmptyPanel({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
}) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard style={styles.emptyPanel}>
      <View style={[styles.emptyIcon, { backgroundColor: tokens.surfaceSecondary }]}>
        <Ionicons color={tokens.textMuted} name={icon} size={24} />
      </View>
      <Text text={title} size="sm" weight="semiBold" style={{ color: tokens.textPrimary }} />
      <Text
        text={subtitle}
        size="xxs"
        style={[styles.emptySubtitle, { color: tokens.textSecondary }]}
      />
    </SurfaceCard>
  )
}

function AvailabilityRow({ day, onPress }: { day: AvailabilityDay; onPress: () => void }) {
  const tokens = useDesignTokens()
  const copy = availabilityCopy[day.status]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.availabilityRow,
        { borderBottomColor: tokens.border, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View style={[styles.availabilityIcon, { backgroundColor: tokens.surfaceSecondary }]}>
        <Ionicons color={tokens.textSecondary} name={copy.icon} size={19} />
      </View>
      <View style={styles.flex}>
        <Text
          text={formatFullDate(day.date)}
          numberOfLines={1}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${day.startTime} - ${day.endTime}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Pill label={copy.label} tone={copy.tone} />
      <Ionicons color={tokens.textMuted} name="chevron-forward" size={16} />
    </Pressable>
  )
}

function RequestRow({ request }: { request: RequestItem }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.requestRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.requestIcon, { backgroundColor: tokens.surfaceSecondary }]}>
        <Ionicons color={tokens.accent} name="swap-horizontal-outline" size={19} />
      </View>
      <View style={styles.flex}>
        <Text
          text={request.type}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${request.dateRange} - ${request.reason}`}
          numberOfLines={1}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Pill label={request.status} tone={getRequestTone(request.status)} />
    </View>
  )
}

export function ScheduleScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { selectedEmployer, state } = useAppSession()
  const [segment, setSegment] = useState<Segment>("shifts")
  const [selectedDate, setSelectedDate] = useState(
    state.shifts[0]?.date ?? new Date().toISOString(),
  )

  const shiftsByDate = useMemo(() => {
    return state.shifts.reduce((result, shift) => {
      const shifts = result.get(shift.date) ?? []
      result.set(shift.date, [...shifts, shift])
      return result
    }, new Map<string, Shift[]>())
  }, [state.shifts])

  const dateStripDates = useMemo(() => {
    const sourceDates = Array.from(new Set(state.shifts.map((shift) => shift.date))).slice(0, 7)

    return sourceDates.length > 0 ? sourceDates : [selectedDate]
  }, [selectedDate, state.shifts])

  const selectedDayShifts = shiftsByDate.get(selectedDate) ?? []
  const upcomingShifts = state.shifts.filter((shift) => shift.date > selectedDate).slice(0, 6)
  const weeklyAvailability = Object.values(state.availability).slice(0, 7)
  const weeklyAvailabilityCount = weeklyAvailability.filter(
    (day) => day.status === "available" || day.status === "preferred",
  ).length

  const openShift = (shift: Shift) => router.push(`/(app)/shift/${shift.id}` as never)

  return (
    <AppScrollScreen variant="grouped">
      <PageHeader eyebrow={selectedEmployer?.name ?? "Schedule"} title="Schedule" />
      <SummaryCard
        selectedDate={selectedDate}
        selectedShiftCount={selectedDayShifts.length}
        totalRequestCount={state.requests.length}
        weeklyAvailabilityCount={weeklyAvailabilityCount}
      />

      <DateStrip
        dates={dateStripDates}
        selectedDate={selectedDate}
        shiftsByDate={shiftsByDate}
        onSelectDate={setSelectedDate}
      />

      <NativeSegmentControl selected={segment} onSelect={setSegment} />

      {segment === "shifts" ? (
        <View style={styles.stack}>
          <View style={styles.sectionHeader}>
            <Text
              text={formatFullDate(selectedDate)}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textSecondary }}
            />
            <Text
              text={`${upcomingShifts.length} upcoming`}
              size="xxs"
              style={{ color: tokens.textMuted }}
            />
          </View>

          {selectedDayShifts.length > 0 ? (
            selectedDayShifts.map((shift) => (
              <ShiftRow key={shift.id} shift={shift} onPress={() => openShift(shift)} />
            ))
          ) : (
            <EmptyPanel
              icon="bed-outline"
              title="Day off"
              subtitle="No shift is scheduled for this date."
            />
          )}

          {upcomingShifts.length > 0 ? (
            <View style={styles.stack}>
              <Text
                text="UPCOMING"
                size="xxs"
                weight="medium"
                style={[styles.capsLabel, { color: tokens.textMuted }]}
              />
              {upcomingShifts.map((shift) => (
                <ShiftRow
                  key={`upcoming-${shift.id}`}
                  shift={shift}
                  onPress={() => openShift(shift)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {segment === "availability" ? (
        <View style={styles.stack}>
          <GroupedSection
            actionLabel="Set"
            title="This week"
            onAction={() => router.push(`/(app)/availability/${selectedDate}` as never)}
          >
            {weeklyAvailability.map((day) => (
              <AvailabilityRow
                key={day.date}
                day={day}
                onPress={() => router.push(`/(app)/availability/${day.date}` as never)}
              />
            ))}
          </GroupedSection>
        </View>
      ) : null}

      {segment === "requests" ? (
        <View style={styles.stack}>
          {state.requests.length > 0 ? (
            <GroupedSection
              actionLabel="New"
              title="Requests"
              onAction={() => router.push("/(app)/request" as never)}
            >
              {state.requests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </GroupedSection>
          ) : (
            <>
              <AppButton
                label="New request"
                onPress={() => router.push("/(app)/request" as never)}
              />
              <EmptyPanel
                icon="file-tray-outline"
                title="No requests"
                subtitle="Time off and shift swap requests will appear here."
              />
            </>
          )}
        </View>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  availabilityIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  availabilityRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  capsLabel: {
    letterSpacing: 0.5,
  },
  dateButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    height: 68,
    justifyContent: "center",
    width: 46,
  },
  dateStrip: {
    flexDirection: "row",
    gap: 8,
  },
  emptyIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyPanel: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
  nativeSegmentControl: {
    height: 34,
  },
  requestIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  requestRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shiftBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  shiftCard: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 13,
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  shiftDate: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 50,
    justifyContent: "center",
    width: 44,
  },
  shiftDot: {
    borderRadius: 3,
    height: 6,
    marginTop: 1,
    width: 6,
  },
  shiftFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  shiftPrimaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  shiftPressable: {
    borderCurve: "continuous",
    borderRadius: 18,
  },
  shiftStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  shiftStatusDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  shiftTime: {
    fontSize: 18,
    lineHeight: 23,
  },
  shiftTrailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  stack: {
    gap: 14,
  },
  summaryBody: {
    gap: 12,
    padding: 14,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
})
