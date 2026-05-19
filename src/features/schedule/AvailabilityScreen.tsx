/* eslint-disable react-native/no-inline-styles */

import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

import { formatFullDate } from "@/core/date"
import type { AvailabilityStatus } from "@/core/models"
import {
  availabilityStatusOptions,
  durationLabel,
  formatTime,
  nearestMinute,
  timeValueToDate,
} from "@/features/schedule/availability.utils"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { getTemplateAvailability, getWeekdayKey } from "@/features/schedule/schedule.utils"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  ListRow,
  SelectionRow,
  Text,
  TextField,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timeValueToDate(value))
}

function TimeValue({ value }: { value: string }) {
  const tokens = useDesignTokens()
  return (
    <Text
      text={formatTimeLabel(value)}
      size="xs"
      weight="semiBold"
      style={{ color: tokens.accent }}
    />
  )
}

export function AvailabilityScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const {
    date = new Date().toISOString().slice(0, 10),
    timeField,
    timeNonce,
    timeValue,
  } = useLocalSearchParams<{
    date: string
    timeField?: "startTime" | "endTime"
    timeNonce?: string
    timeValue?: string
  }>()
  const { theme } = useAppTheme()
  const tokens = useDesignTokens()
  const { saveAvailabilityOverride } = useScheduleActions()
  const { state } = useScheduleStateQuery()

  const templateDay = useMemo(
    () =>
      state
        ? getTemplateAvailability(state.availabilityTemplate, date)
        : { status: "available" as const, startTime: "17:00", endTime: "23:00" },
    [date, state],
  )
  const existingOverride = state?.availabilityOverrides[date]
  const initialDay = existingOverride ?? { date, ...templateDay }

  const [status, setStatus] = useState<AvailabilityStatus>(initialDay.status)
  const [startTime, setStartTime] = useState(initialDay.startTime)
  const [endTime, setEndTime] = useState(initialDay.endTime)
  const [note, setNote] = useState(initialDay.note ?? "")
  const [activeTimeField, setActiveTimeField] = useState<"startTime" | "endTime" | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pickerValue = activeTimeField === "endTime" ? endTime : startTime
  const weekdayLabel = getWeekdayKey(date)

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return
    }

    setIsSaving(true)
    try {
      const result = await saveAvailabilityOverride({
        date,
        endTime,
        note: note.trim() || undefined,
        startTime,
        status,
      })
      if (!result.ok) return
      router.back()
    } finally {
      setIsSaving(false)
    }
  }, [date, endTime, isSaving, note, router, saveAvailabilityOverride, startTime, status])

  const updateTimeValue = useCallback((field: "startTime" | "endTime", nextValue: string) => {
    if (field === "startTime") {
      setStartTime(nextValue)
    } else {
      setEndTime(nextValue)
    }
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions(
      createHeaderActionOptions(theme, {
        left: {
          kind: "close",
          onPress: () => {
            router.back()
          },
        },
        right: {
          label: "Save",
          kind: "confirm",
          onPress: () => {
            void handleSave()
          },
          disabled: isSaving,
        },
      }),
    )
  }, [handleSave, isSaving, navigation, router, theme])

  useLayoutEffect(() => {
    if (!timeNonce || !timeField || !timeValue) {
      return
    }

    updateTimeValue(timeField, timeValue)
    router.setParams({
      timeField: undefined,
      timeNonce: undefined,
      timeValue: undefined,
    })
  }, [router, timeField, timeNonce, timeValue, updateTimeValue])

  const handleAndroidTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== "set" || !selectedDate || !activeTimeField) {
      setActiveTimeField(null)
      return
    }

    const nextValue = formatTime(selectedDate.getHours(), nearestMinute(selectedDate.getMinutes()))
    updateTimeValue(activeTimeField, nextValue)
    setActiveTimeField(null)
  }

  const handleTimePress = (field: "startTime" | "endTime") => {
    if (Platform.OS === "ios") {
      router.push({
        params: {
          date,
          field,
          returnTo: "availability",
          title: field === "startTime" ? "Choose start time" : "Choose end time",
          value: field === "startTime" ? startTime : endTime,
        },
        pathname: "/(app)/availability-time-picker",
      })
      return
    }

    setActiveTimeField(field)
  }

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text
            text={formatFullDate(date)}
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 24 }}
          />
          <Text
            text={`Override your ${weekdayLabel} template for this specific date.`}
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
        </View>

        <GroupedSection title="Default for this weekday">
          <View style={styles.templateSummary}>
            <View style={[styles.templateGlyph, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons color={tokens.accent} name="repeat-outline" size={18} />
            </View>
            <View style={styles.flex}>
              <Text
                text={`${availabilityStatusOptions[templateDay.status].label} · ${formatTimeLabel(templateDay.startTime)} to ${formatTimeLabel(templateDay.endTime)}`}
                size="xs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text={
                  existingOverride
                    ? "A date-specific override is active."
                    : "No override yet. Save to customize this date."
                }
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
          </View>
        </GroupedSection>

        <GroupedSection title="Availability status">
          {(Object.keys(availabilityStatusOptions) as AvailabilityStatus[]).map(
            (candidate, index, items) => {
              const option = availabilityStatusOptions[candidate]
              const active = candidate === status
              const activeColor =
                option.tone === "success"
                  ? tokens.success
                  : option.tone === "accent"
                    ? tokens.accent
                    : tokens.textSecondary

              return (
                <SelectionRow
                  key={candidate}
                  backgroundColor={tokens.transparent}
                  dividerInset={58}
                  isLast={index === items.length - 1}
                  leading={
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
                  }
                  onPress={() => setStatus(candidate)}
                  selected={active}
                  style={styles.statusRow}
                  subtitle={option.description}
                  title={option.label}
                  trailing={
                    active ? (
                      <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
                    ) : null
                  }
                />
              )
            },
          )}
        </GroupedSection>

        {status !== "unavailable" ? (
          <View style={styles.timeSection}>
            <GroupedSection title="Working hours">
              <ListRow
                title="From"
                subtitle="When you can start"
                trailing={<TimeValue value={startTime} />}
                onPress={() => handleTimePress("startTime")}
              />
              <ListRow
                title="To"
                subtitle="When you can finish"
                trailing={<TimeValue value={endTime} />}
                onPress={() => handleTimePress("endTime")}
                isLast
              />
              {activeTimeField && Platform.OS === "android" ? (
                <DateTimePicker
                  display="default"
                  mode="time"
                  minuteInterval={15}
                  onChange={handleAndroidTimeChange}
                  value={timeValueToDate(pickerValue)}
                />
              ) : null}
            </GroupedSection>
            <Text
              text={`Total span ${durationLabel(startTime, endTime)}`}
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted, textAlign: "center" }}
            />
          </View>
        ) : null}

        <TextField
          containerStyle={styles.noteShell}
          inputStyle={styles.noteInput}
          label="Note"
          multiline
          numberOfLines={3}
          onChangeText={setNote}
          placeholder="Optional context for your manager"
          textAlignVertical="top"
          value={note}
          variant="muted"
        />

        {existingOverride ? (
          <View style={styles.buttonStack}>
            <AppButton
              label="Use weekly template instead"
              onPress={async () => {
                const result = await saveAvailabilityOverride({
                  date,
                  endTime: templateDay.endTime,
                  note: undefined,
                  startTime: templateDay.startTime,
                  status: templateDay.status,
                })
                if (!result.ok) return
                router.back()
              }}
              variant="secondary"
            />
          </View>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  buttonStack: {
    gap: 10,
  },
  content: {
    gap: 18,
  },
  flex: {
    flex: 1,
  },
  intro: {
    gap: 6,
  },
  noteInput: {
    fontSize: 15,
    minHeight: 72,
    paddingTop: 2,
  },
  noteShell: {
    minHeight: 116,
  },
  screen: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  statusRow: {
    borderWidth: 0,
    paddingHorizontal: 14,
  },
  templateGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  templateSummary: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  timeSection: {
    gap: 8,
  },
})
