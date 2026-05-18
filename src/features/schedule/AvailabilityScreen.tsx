/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"

import type { AvailabilityStatus } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  ListRow,
  Text,
  appLayout,
  useDesignTokens,
} from "@/ui"

const TIME_REFERENCE_DATE = "2026-01-01"

const statusOptions: Record<
  AvailabilityStatus,
  { label: string; description: string; tone: "dark" | "success" | "accent" }
> = {
  unavailable: { label: "Unavailable", description: "Day off", tone: "dark" },
  available: { label: "Available", description: "Can work if needed", tone: "success" },
  preferred: { label: "Preferred", description: "I prefer to work", tone: "accent" },
}

function nearestMinute(minute: number) {
  const options = [0, 15, 30, 45]
  const closest = options.reduce((current, candidate) =>
    Math.abs(candidate - minute) < Math.abs(current - minute) ? candidate : current,
  )
  return String(closest).padStart(2, "0")
}

function parseTime(value: string): [number, string] {
  const [hour, minute = "0"] = value.split(":")
  return [Number.parseInt(hour, 10) || 0, nearestMinute(Number.parseInt(minute, 10) || 0)]
}

function formatTime(hour: number, minute: string) {
  return `${String((hour + 24) % 24).padStart(2, "0")}:${minute}`
}

function timeValueToDate(value: string) {
  const [hour, minute] = parseTime(value)
  return new Date(`${TIME_REFERENCE_DATE}T${String(hour).padStart(2, "0")}:${minute}:00`)
}

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timeValueToDate(value))
}

function durationLabel(startTime: string, endTime: string) {
  const [startHour, startMinute] = parseTime(startTime)
  const [endHour, endMinute] = parseTime(endTime)
  const start = startHour * 60 + Number(startMinute)
  let end = endHour * 60 + Number(endMinute)
  if (end <= start) end += 24 * 60

  const minutes = end - start
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`
}

export function AvailabilityScreen() {
  const router = useRouter()
  const { date = new Date().toISOString() } = useLocalSearchParams<{ date: string }>()
  const tokens = useDesignTokens()
  const { updateAvailability } = useScheduleActions()
  const { state } = useScheduleStateQuery()

  const day = useMemo(
    () =>
      state?.availability[date] ?? {
        date,
        status: "available" as const,
        startTime: "17:00",
        endTime: "23:00",
      },
    [date, state?.availability],
  )
  const [status, setStatus] = useState<AvailabilityStatus>(day.status)
  const [startTime, setStartTime] = useState(day.startTime)
  const [endTime, setEndTime] = useState(day.endTime)
  const [activeTimeField, setActiveTimeField] = useState<"startTime" | "endTime" | null>(null)

  const pickerValue = activeTimeField === "endTime" ? endTime : startTime

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type !== "set" || !selectedDate || !activeTimeField) {
        setActiveTimeField(null)
        return
      }
    }

    if (!selectedDate || !activeTimeField) {
      return
    }

    const nextValue = formatTime(selectedDate.getHours(), nearestMinute(selectedDate.getMinutes()))
    if (activeTimeField === "startTime") {
      setStartTime(nextValue)
    } else {
      setEndTime(nextValue)
    }

    if (Platform.OS === "android") {
      setActiveTimeField(null)
    }
  }

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <View style={styles.content}>
        <GroupedSection title="Availability status">
          {(Object.keys(statusOptions) as AvailabilityStatus[]).map((candidate, index, items) => {
            const option = statusOptions[candidate]
            const active = candidate === status
            const activeColor =
              option.tone === "success"
                ? tokens.success
                : option.tone === "accent"
                  ? tokens.accent
                  : tokens.textSecondary

            return (
              <Pressable
                key={candidate}
                onPress={() => setStatus(candidate)}
                style={({ pressed }) => [
                  styles.statusRow,
                  {
                    backgroundColor: pressed ? tokens.pressed : tokens.transparent,
                  },
                ]}
              >
                <View style={[styles.statusGlyph, { backgroundColor: `${activeColor}1A` }]}>
                  <Ionicons
                    color={activeColor}
                    name={
                      candidate === "preferred"
                        ? "star-outline"
                        : candidate === "available"
                          ? "checkmark-circle-outline"
                          : "remove-circle-outline"
                    }
                    size={18}
                  />
                </View>
                <View style={styles.flex}>
                  <Text
                    text={option.label}
                    size="xs"
                    weight="medium"
                    style={{ color: tokens.textPrimary }}
                  />
                  <Text text={option.description} size="xxs" style={{ color: tokens.textMuted }} />
                </View>
                {active ? (
                  <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
                ) : null}
                {index < items.length - 1 ? (
                  <View style={[styles.rowDivider, { backgroundColor: tokens.separator }]} />
                ) : null}
              </Pressable>
            )
          })}
        </GroupedSection>

        {status !== "unavailable" ? (
          <GroupedSection title="Working hours">
            <ListRow
              title="From"
              subtitle="When you want to start working"
              trailing={<TimeValue value={startTime} />}
              onPress={() =>
                setActiveTimeField((current) => (current === "startTime" ? null : "startTime"))
              }
            />
            <ListRow
              title="To"
              subtitle="When you want to stop working"
              trailing={<TimeValue value={endTime} />}
              onPress={() =>
                setActiveTimeField((current) => (current === "endTime" ? null : "endTime"))
              }
              isLast={activeTimeField == null || Platform.OS === "android"}
            />
            {activeTimeField && Platform.OS === "ios" ? (
              <View
                style={[
                  styles.pickerCard,
                  {
                    backgroundColor: tokens.backgroundMuted,
                    borderColor: tokens.border,
                  },
                ]}
              >
                <Text
                  text={activeTimeField === "startTime" ? "Choose start time" : "Choose end time"}
                  size="xxs"
                  weight="semiBold"
                  style={{ color: tokens.textMuted }}
                />
                <DateTimePicker
                  display="spinner"
                  mode="time"
                  minuteInterval={15}
                  onChange={handleTimeChange}
                  value={timeValueToDate(pickerValue)}
                />
              </View>
            ) : null}
            {activeTimeField && Platform.OS === "android" ? (
              <DateTimePicker
                display="default"
                mode="time"
                minuteInterval={15}
                onChange={handleTimeChange}
                value={timeValueToDate(pickerValue)}
              />
            ) : null}
            <Text
              text={`Duration: ${durationLabel(startTime, endTime)}`}
              size="xs"
              style={{ color: tokens.textSecondary, textAlign: "center" }}
            />
          </GroupedSection>
        ) : null}

        <AppButton
          label="Save availability"
          onPress={async () => {
            const result = await updateAvailability({
              date,
              status,
              startTime,
              endTime,
            })
            if (!result.ok) return
            router.back()
          }}
        />
      </View>
    </AppScrollScreen>
  )
}

function TimeValue({ value }: { value: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.timeValue}>
      <Text
        text={formatTimeLabel(value)}
        size="xs"
        weight="semiBold"
        style={{ color: tokens.textPrimary }}
      />
      <View
        style={[
          styles.timeValueBadge,
          {
            backgroundColor: tokens.accentSoft,
          },
        ]}
      >
        <Ionicons color={tokens.accent} name="time-outline" size={14} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: appLayout.sheetGap,
    paddingBottom: appLayout.sheetPaddingBottom,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
  flex: {
    flex: 1,
  },
  pickerCard: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 62,
    position: "absolute",
    right: 0,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  statusGlyph: {
    alignItems: "center",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeValue: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  timeValueBadge: {
    alignItems: "center",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
})
