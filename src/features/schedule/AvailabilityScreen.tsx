/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import type { AvailabilityStatus } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { AppButton, AppScrollScreen, GroupedSection, Text, useDesignTokens } from "@/ui"

const MINUTES = ["00", "15", "30", "45"] as const

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
  const insets = useSafeAreaInsets()
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

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.surfaceSecondary }}
      topInset="none"
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
            <View style={styles.timeRow}>
              <TimeField label="From" value={startTime} onChange={setStartTime} />
              <Text
                text="-"
                size="lg"
                weight="semiBold"
                style={{ color: tokens.textMuted, paddingTop: 44 }}
              />
              <TimeField label="To" value={endTime} onChange={setEndTime} />
            </View>
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

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const tokens = useDesignTokens()
  const [hour, minute] = parseTime(value)
  const minuteIndex = Math.max(MINUTES.indexOf(minute as (typeof MINUTES)[number]), 0)
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  const stepHour = (direction: number) => {
    onChange(formatTime(hour + direction, minute))
  }

  const stepMinute = (direction: number) => {
    const nextIndex = (minuteIndex + direction + MINUTES.length) % MINUTES.length
    if (direction > 0 && nextIndex === 0) {
      onChange(formatTime(hour + 1, "00"))
      return
    }
    if (direction < 0 && minuteIndex === 0) {
      onChange(formatTime(hour - 1, "45"))
      return
    }
    onChange(formatTime(hour, MINUTES[nextIndex]))
  }

  return (
    <View style={[styles.timeField, { backgroundColor: tokens.background }]}>
      <Text
        text={label.toUpperCase()}
        style={{ color: tokens.textMuted, fontSize: 11, fontWeight: "600", lineHeight: 14 }}
      />
      <Stepper
        value={String(displayHour).padStart(2, "0")}
        onDown={() => stepHour(-1)}
        onUp={() => stepHour(1)}
      />
      <View style={[styles.timeDivider, { backgroundColor: tokens.border }]} />
      <Stepper value={minute} onDown={() => stepMinute(-1)} onUp={() => stepMinute(1)} />
      <View style={[styles.periodPill, { backgroundColor: tokens.accentSoft }]}>
        <Text
          text={hour < 12 ? "AM" : "PM"}
          size="xxs"
          weight="semiBold"
          style={{ color: tokens.accent }}
        />
      </View>
    </View>
  )
}

function Stepper({ value, onDown, onUp }: { value: string; onDown: () => void; onUp: () => void }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stepperRow}>
      <RoundIconButton icon="chevron-down-outline" onPress={onDown} />
      <Text
        text={value}
        weight="bold"
        style={{
          color: tokens.textPrimary,
          fontSize: 28,
          lineHeight: 34,
          minWidth: 44,
          textAlign: "center",
        }}
      />
      <RoundIconButton icon="chevron-up-outline" onPress={onUp} />
    </View>
  )
}

function RoundIconButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roundButton,
        {
          backgroundColor: tokens.surfaceSecondary,
          borderColor: tokens.border,
        },
      ]}
    >
      <Ionicons color={tokens.accent} name={icon} size={15} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  flex: {
    flex: 1,
  },
  periodPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roundButton: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
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
    paddingBottom: 30,
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
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  timeDivider: {
    height: 1,
    width: "70%",
  },
  timeField: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  timeRow: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 10,
  },
})
