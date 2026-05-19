/* eslint-disable react-native/no-inline-styles */

import { useCallback, useLayoutEffect, useState } from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

import type { AvailabilityStatus, AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"
import {
  availabilityStatusOptions,
  durationLabel,
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
  Text,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"

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

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timeValueToDate(value))
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
              <Pressable
                key={weekday}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/availability-template/[day]",
                    params: { day: weekday },
                  })
                }
                style={({ pressed }) => [
                  styles.weekdayRow,
                  {
                    backgroundColor: pressed ? tokens.pressed : tokens.transparent,
                  },
                ]}
              >
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
                <View style={styles.flex}>
                  <Text
                    text={availabilityWeekdayLabels[weekday]}
                    size="xs"
                    weight="semiBold"
                    style={{ color: tokens.textPrimary }}
                  />
                  <Text text={statusSummary} size="xxs" style={{ color: statusColor }} />
                </View>
                <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
                {index < availabilityWeekdays.length - 1 ? (
                  <View style={[styles.rowDivider, { backgroundColor: tokens.separator }]} />
                ) : null}
              </Pressable>
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
      if (!result.ok) return
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
                <Pressable
                  key={candidate}
                  onPress={() => updateRule((current) => ({ ...current, status: candidate }))}
                  style={({ pressed }) => [
                    styles.statusRow,
                    { backgroundColor: pressed ? tokens.pressed : tokens.transparent },
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
                    <Text
                      text={option.description}
                      size="xxs"
                      style={{ color: tokens.textMuted }}
                    />
                  </View>
                  {active ? (
                    <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
                  ) : null}
                  {index < items.length - 1 ? (
                    <View style={[styles.rowDivider, { backgroundColor: tokens.separator }]} />
                  ) : null}
                </Pressable>
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
  flex: {
    flex: 1,
  },
  intro: {
    gap: 6,
  },
  rowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 58,
    position: "absolute",
    right: 0,
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
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  weekdayStatusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
})
