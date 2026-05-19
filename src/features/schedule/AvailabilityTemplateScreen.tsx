/* eslint-disable react-native/no-inline-styles */

import { useCallback, useLayoutEffect, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

import type { AvailabilityStatus, AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"
import {
  availabilityStatusOptions,
  durationLabel,
  formatTimeLabel,
  formatTime,
  nearestMinute,
  timeValueToDate,
} from "@/features/schedule/availability.utils"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { availabilityWeekdayLabels, availabilityWeekdays } from "@/features/schedule/schedule.utils"
import {
  AppScrollScreen,
  GroupedSection,
  ListRow,
  SelectionIndicator,
  SelectionRow,
  Text,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"
import { fireHaptic } from "@/utils/haptics"

function getFallbackTemplate(): AvailabilityTemplate {
  return {
    monday: { status: "available", startTime: "09:00", endTime: "17:00" },
    tuesday: { status: "available", startTime: "09:00", endTime: "17:00" },
    wednesday: { status: "available", startTime: "09:00", endTime: "17:00" },
    thursday: { status: "available", startTime: "09:00", endTime: "17:00" },
    friday: { status: "available", startTime: "09:00", endTime: "17:00" },
    saturday: { status: "available", startTime: "09:00", endTime: "17:00" },
    sunday: { status: "available", startTime: "09:00", endTime: "17:00" },
  }
}

function getAvailabilityColor(
  status: AvailabilityStatus,
  tokens: ReturnType<typeof useDesignTokens>,
) {
  switch (status) {
    case "available":
      return tokens.success
    case "preferred":
      return tokens.accent
    case "unavailable":
      return tokens.textMuted
  }
}

function getAvailabilitySummary(day: AvailabilityTemplate[AvailabilityWeekday]) {
  if (day.status === "unavailable") {
    return "Not available for work"
  }

  return `${formatTimeLabel(day.startTime)} to ${formatTimeLabel(day.endTime)}`
}

function getDay(value?: string): AvailabilityWeekday {
  return value && availabilityWeekdays.includes(value as AvailabilityWeekday)
    ? (value as AvailabilityWeekday)
    : "monday"
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

export function AvailabilityTemplateScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { state } = useScheduleStateQuery()
  const template = state?.availabilityTemplate ?? getFallbackTemplate()

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
      topInset="none"
      variant="grouped"
    >
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text
            text="Weekly template"
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 24 }}
          />
          <Text
            text="Set your usual pattern here, then adjust specific dates only when something changes."
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
        </View>

        <GroupedSection title="Your usual week">
          {availabilityWeekdays.map((weekday, index) => {
            const day = template[weekday]
            const statusColor = getAvailabilityColor(day.status, tokens)
            const statusSummary = getAvailabilitySummary(day)

            return (
              <SelectionRow
                key={weekday}
                backgroundColor={tokens.transparent}
                dividerInset={58}
                grouped
                isLast={index === availabilityWeekdays.length - 1}
                leading={
                  <View style={styles.weekdayLeading}>
                    <View
                      style={[
                        styles.weekdayStatusDot,
                        {
                          backgroundColor: statusColor,
                          opacity: day.status === "unavailable" ? 0.7 : 1,
                        },
                      ]}
                    />
                  </View>
                }
                onPress={() =>
                  router.push({
                    pathname: "/(app)/availability-template/[day]",
                    params: { day: weekday },
                  })
                }
                selected={false}
                style={styles.weekdayRow}
                subtitle={statusSummary}
                title={availabilityWeekdayLabels[weekday]}
                trailing={
                  <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
                }
              />
            )
          })}
        </GroupedSection>
      </View>
    </AppScrollScreen>
  )
}

export function AvailabilityTemplateDayScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useAppTheme()
  const tokens = useDesignTokens()
  const { state } = useScheduleStateQuery()
  const { saveAvailabilityTemplate } = useScheduleActions()
  const {
    day: rawDay,
    timeField,
    timeNonce,
    timeValue,
  } = useLocalSearchParams<{
    day?: string
    timeField?: "startTime" | "endTime"
    timeNonce?: string
    timeValue?: string
  }>()
  const day = getDay(rawDay)
  const template = state?.availabilityTemplate ?? getFallbackTemplate()
  const baseRule = template[day]
  const [editedRule, setEditedRule] = useState(baseRule)
  const [activeTimeField, setActiveTimeField] = useState<"startTime" | "endTime" | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pickerValue = activeTimeField === "endTime" ? editedRule.endTime : editedRule.startTime

  useLayoutEffect(() => {
    setEditedRule(template[day])
  }, [day, template])

  const updateRule = useCallback(
    (
      updater: (
        current: AvailabilityTemplate[AvailabilityWeekday],
      ) => AvailabilityTemplate[AvailabilityWeekday],
    ) => {
      setEditedRule((current) => updater(current))
    },
    [],
  )

  const updateTimeValue = useCallback(
    (field: "startTime" | "endTime", nextValue: string) => {
      updateRule((current) => ({
        ...current,
        [field]: nextValue,
      }))
    },
    [updateRule],
  )

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return
    }

    setIsSaving(true)
    try {
      const result = await saveAvailabilityTemplate({
        ...template,
        [day]: editedRule,
      })
      if (!result.ok) {
        fireHaptic("error")
        return
      }

      fireHaptic("success")
      router.back()
    } finally {
      setIsSaving(false)
    }
  }, [day, editedRule, isSaving, router, saveAvailabilityTemplate, template])

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
          disabled: isSaving,
          kind: "confirm",
          haptic: "none",
          onPress: () => {
            void handleSave()
          },
        },
      }),
    )
  }, [handleSave, isSaving, navigation, router, theme])

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
        pathname: "/(app)/availability-time-picker",
        params: {
          day,
          field,
          returnTo: "availability-template-day",
          title: field === "startTime" ? "Choose start time" : "Choose end time",
          value: field === "startTime" ? editedRule.startTime : editedRule.endTime,
        },
      })
      return
    }

    setActiveTimeField(field)
  }

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

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <Stack.Screen options={{ title: `${availabilityWeekdayLabels[day]} defaults` }} />

      <View style={styles.content}>
        <GroupedSection title={`${availabilityWeekdayLabels[day]} defaults`}>
          {(Object.keys(availabilityStatusOptions) as AvailabilityStatus[]).map(
            (candidate, index, items) => {
              const option = availabilityStatusOptions[candidate]
              const active = candidate === editedRule.status
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
                  grouped
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
                  onPress={() => updateRule((current) => ({ ...current, status: candidate }))}
                  selected={active}
                  style={styles.statusRow}
                  subtitle={option.description}
                  title={option.label}
                  trailing={active ? <SelectionIndicator /> : null}
                />
              )
            },
          )}
        </GroupedSection>

        {editedRule.status !== "unavailable" ? (
          <View style={styles.timeSection}>
            <GroupedSection title="Typical working hours">
              <ListRow
                title="From"
                subtitle="Usual start"
                trailing={<TimeValue value={editedRule.startTime} />}
                onPress={() => handleTimePress("startTime")}
              />
              <ListRow
                title="To"
                subtitle="Usual finish"
                trailing={<TimeValue value={editedRule.endTime} />}
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
              text={`Total span ${durationLabel(editedRule.startTime, editedRule.endTime)}`}
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted, textAlign: "center" }}
            />
          </View>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  intro: {
    gap: 6,
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
  timeSection: {
    gap: 8,
  },
  weekdayLeading: {
    alignItems: "center",
    justifyContent: "center",
    width: 10,
  },
  weekdayRow: {
    borderWidth: 0,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  weekdayStatusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
})
