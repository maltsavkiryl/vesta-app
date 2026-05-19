import { useCallback, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import DateTimePicker from "@react-native-community/datetimepicker"

import { formatTime, nearestMinute, timeValueToDate } from "@/features/schedule/availability.utils"
import { createHeaderActionOptions, useAppTheme, useDesignTokens } from "@/ui"

type AvailabilityTimeField = "startTime" | "endTime"
type AvailabilityTimeReturnTarget =
  | "availability"
  | "availability-template"
  | "availability-template-day"

function isTimeField(value?: string): value is AvailabilityTimeField {
  return value === "startTime" || value === "endTime"
}

function isReturnTarget(value?: string): value is AvailabilityTimeReturnTarget {
  return (
    value === "availability" ||
    value === "availability-template" ||
    value === "availability-template-day"
  )
}

export function AvailabilityTimePickerScreen() {
  const router = useRouter()
  const { theme } = useAppTheme()
  const tokens = useDesignTokens()
  const {
    date,
    day,
    field: rawField,
    returnTo: rawReturnTo,
    title,
    value = "09:00",
  } = useLocalSearchParams<{
    date?: string
    day?: string
    field?: string
    returnTo?: string
    title?: string
    value?: string
  }>()

  const field: AvailabilityTimeField = isTimeField(rawField) ? rawField : "startTime"
  const returnTo: AvailabilityTimeReturnTarget = isReturnTarget(rawReturnTo)
    ? rawReturnTo
    : "availability"
  const [selectedValue, setSelectedValue] = useState(value)

  const closeSheet = useCallback(() => {
    router.back()
  }, [router])

  const confirmSelection = useCallback(
    (nextValue: string) => {
      const timeNonce = Date.now().toString()

      if (returnTo === "availability-template") {
        router.dismissTo({
          params: {
            day,
            timeField: field,
            timeNonce,
            timeValue: nextValue,
          },
          pathname: "/(app)/availability-template",
        })
        return
      }

      if (returnTo === "availability-template-day") {
        if (!day) {
          router.back()
          return
        }

        router.dismissTo({
          params: {
            day,
            timeField: field,
            timeNonce,
            timeValue: nextValue,
          },
          pathname: "/(app)/availability-template/[day]",
        })
        return
      }

      if (!date) {
        router.back()
        return
      }

      router.dismissTo({
        params: {
          date,
          timeField: field,
          timeNonce,
          timeValue: nextValue,
        },
        pathname: "/(app)/availability/[date]",
      })
    },
    [date, day, field, returnTo, router],
  )
  const headerActions = useMemo(
    () =>
      createHeaderActionOptions(theme, {
        left: { kind: "close", onPress: closeSheet },
        right: {
          kind: "confirm",
          label: "",
          onPress: () => confirmSelection(selectedValue),
        },
      }),
    [closeSheet, confirmSelection, selectedValue, theme],
  )

  return (
    <View style={[styles.screen, { backgroundColor: tokens.surfaceSecondary }]}>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          title: title ?? (field === "startTime" ? "Choose start time" : "Choose end time"),
          ...headerActions,
        }}
      />
      <View style={styles.pickerWrap}>
        <DateTimePicker
          display="spinner"
          mode="time"
          minuteInterval={15}
          onChange={(_, selectedDate) => {
            if (!selectedDate) return
            setSelectedValue(
              formatTime(selectedDate.getHours(), nearestMinute(selectedDate.getMinutes())),
            )
          }}
          value={timeValueToDate(selectedValue)}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerWrap: {
    alignItems: "center",
    flex: 1,
    minHeight: 232,
    justifyContent: "center",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
})
