import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { AvailabilityDay, AvailabilityStatus, RequestItem, Shift } from "@/core/models"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  AppButton,
  AppScrollScreen,
  AppSegmentedControl,
  DateBadge,
  ListCard,
  ListCardItem,
  MetricGrid,
  PageHeader,
  Pill,
  SectionBlock,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

type Segment = "shifts" | "availability" | "requests"

const segmentOptions: { label: string; value: Segment }[] = [
  { label: "Shifts", value: "shifts" },
  { label: "Availability", value: "availability" },
  { label: "Requests", value: "requests" },
]

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
    <SectionBlock title={formatFullDate(selectedDate)}>
      <SurfaceCard style={styles.summaryCard}>
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
      </SurfaceCard>
    </SectionBlock>
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
        <DateBadge
          label={shift.dayLabel}
          value={formatShortDate(shift.date).replace("May ", "")}
          variant="muted"
        />
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

function AvailabilityRow({
  day,
  isLast,
  onPress,
}: {
  day: AvailabilityDay
  isLast?: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const copy = availabilityCopy[day.status]

  return (
    <ListCardItem
      isLast={isLast}
      leading={
        <View style={[styles.availabilityIcon, { backgroundColor: tokens.surfaceSecondary }]}>
          <Ionicons color={tokens.textSecondary} name={copy.icon} size={19} />
        </View>
      }
      onPress={onPress}
      subtitle={`${day.startTime} - ${day.endTime}`}
      subtitleStyle={{ color: tokens.textSecondary }}
      title={formatFullDate(day.date)}
      titleStyle={{ color: tokens.textPrimary }}
      trailing={
        <View style={styles.rowTrailing}>
          <Pill label={copy.label} tone={copy.tone} />
          <Ionicons color={tokens.textMuted} name="chevron-forward" size={16} />
        </View>
      }
    />
  )
}

function RequestRow({ request, isLast }: { request: RequestItem; isLast?: boolean }) {
  const tokens = useDesignTokens()

  return (
    <ListCardItem
      isLast={isLast}
      leading={
        <View style={[styles.requestIcon, { backgroundColor: tokens.surfaceSecondary }]}>
          <Ionicons color={tokens.accent} name="swap-horizontal-outline" size={19} />
        </View>
      }
      subtitle={`${request.dateRange} - ${request.reason}`}
      subtitleStyle={{ color: tokens.textSecondary }}
      title={request.type}
      titleStyle={{ color: tokens.textPrimary }}
      trailing={<Pill label={request.status} tone={getRequestTone(request.status)} />}
    />
  )
}

export function ScheduleScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { selectedEmployer, state } = useScheduleStateQuery()
  const [segment, setSegment] = useState<Segment>("shifts")
  const [selectedDate, setSelectedDate] = useState(
    state?.shifts[0]?.date ?? new Date().toISOString(),
  )

  const shiftsByDate = useMemo(() => {
    return (state?.shifts ?? []).reduce((result, shift) => {
      const shifts = result.get(shift.date) ?? []
      result.set(shift.date, [...shifts, shift])
      return result
    }, new Map<string, Shift[]>())
  }, [state?.shifts])

  const dateStripDates = useMemo(() => {
    const sourceDates = Array.from(new Set((state?.shifts ?? []).map((shift) => shift.date))).slice(
      0,
      7,
    )

    return sourceDates.length > 0 ? sourceDates : [selectedDate]
  }, [selectedDate, state?.shifts])

  const selectedDayShifts = shiftsByDate.get(selectedDate) ?? []
  const upcomingShifts = (state?.shifts ?? [])
    .filter((shift) => shift.date > selectedDate)
    .slice(0, 6)
  const weeklyAvailability = Object.values(state?.availability ?? {}).slice(0, 7)
  const weeklyAvailabilityCount = weeklyAvailability.filter(
    (day) => day.status === "available" || day.status === "preferred",
  ).length

  const openShift = (shift: Shift) => router.push(`/(app)/shift/${shift.id}` as never)

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <PageHeader eyebrow={selectedEmployer?.name ?? "Schedule"} title="Schedule" />
      <SummaryCard
        selectedDate={selectedDate}
        selectedShiftCount={selectedDayShifts.length}
        totalRequestCount={state?.requests.length ?? 0}
        weeklyAvailabilityCount={weeklyAvailabilityCount}
      />

      <DateStrip
        dates={dateStripDates}
        selectedDate={selectedDate}
        shiftsByDate={shiftsByDate}
        onSelectDate={setSelectedDate}
      />

      <AppSegmentedControl options={segmentOptions} value={segment} onChange={setSegment} />

      {segment === "shifts" ? (
        <View style={styles.stack}>
          <SectionBlock
            title={formatFullDate(selectedDate)}
            trailing={
              <Text
                text={`${upcomingShifts.length} upcoming`}
                size="xxs"
                style={{ color: tokens.textMuted }}
              />
            }
          >
            <View style={styles.stack}>
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
            </View>
          </SectionBlock>

          {upcomingShifts.length > 0 ? (
            <SectionBlock title="Upcoming">
              <View style={styles.stack}>
                {upcomingShifts.map((shift) => (
                  <ShiftRow
                    key={`upcoming-${shift.id}`}
                    shift={shift}
                    onPress={() => openShift(shift)}
                  />
                ))}
              </View>
            </SectionBlock>
          ) : null}
        </View>
      ) : null}

      {segment === "availability" ? (
        <View style={styles.stack}>
          <SectionBlock
            actionLabel="Set"
            title="This week"
            onAction={() => router.push(`/(app)/availability/${selectedDate}` as never)}
          >
            <ListCard>
              {weeklyAvailability.map((day, index) => (
                <AvailabilityRow
                  key={day.date}
                  day={day}
                  isLast={index === weeklyAvailability.length - 1}
                  onPress={() => router.push(`/(app)/availability/${day.date}` as never)}
                />
              ))}
            </ListCard>
          </SectionBlock>
        </View>
      ) : null}

      {segment === "requests" ? (
        <View style={styles.stack}>
          {(state?.requests.length ?? 0) > 0 ? (
            <SectionBlock
              actionLabel="New"
              title="Requests"
              onAction={() => router.push("/(app)/request" as never)}
            >
              <ListCard>
                {(state?.requests ?? []).map((request, index) => (
                  <RequestRow
                    key={request.id}
                    isLast={index === (state?.requests.length ?? 0) - 1}
                    request={request}
                  />
                ))}
              </ListCard>
            </SectionBlock>
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
  requestIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  rowTrailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  screen: {
    paddingHorizontal: 16,
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
  shiftPressable: {
    borderCurve: "continuous",
    borderRadius: 18,
  },
  shiftPrimaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
  summaryCard: {
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
})
