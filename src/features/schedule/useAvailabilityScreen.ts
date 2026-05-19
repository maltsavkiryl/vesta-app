import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { Platform } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

import type { AvailabilityStatus } from "@/core/models"
import {
  type AvailabilityTimeField,
  formatTime,
  isAvailabilityTimeField,
  nearestMinute,
} from "@/features/schedule/availability.utils"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { getTemplateAvailability, getWeekdayKey } from "@/features/schedule/schedule.utils"
import { createHeaderActionOptions, useAppTheme } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

type AvailabilityRouteParams = {
  date?: string
  timeField?: string
  timeNonce?: string
  timeValue?: string
}

export function useAvailabilityScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useAppTheme()
  const {
    date = new Date().toISOString().slice(0, 10),
    timeField,
    timeNonce,
    timeValue,
  } = useLocalSearchParams<AvailabilityRouteParams>()
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
  const [activeTimeField, setActiveTimeField] = useState<AvailabilityTimeField | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pickerValue = activeTimeField === "endTime" ? endTime : startTime
  const weekdayLabel = getWeekdayKey(date)

  const updateTimeValue = useCallback((field: AvailabilityTimeField, nextValue: string) => {
    if (field === "startTime") {
      setStartTime(nextValue)
      return
    }

    setEndTime(nextValue)
  }, [])

  const persistOverride = useCallback(
    async ({
      nextEndTime,
      nextNote,
      nextStartTime,
      nextStatus,
    }: {
      nextEndTime: string
      nextNote?: string
      nextStartTime: string
      nextStatus: AvailabilityStatus
    }) => {
      if (isSaving) return false

      setIsSaving(true)
      try {
        const result = await saveAvailabilityOverride({
          date,
          endTime: nextEndTime,
          note: nextNote,
          startTime: nextStartTime,
          status: nextStatus,
        })
        if (!result.ok) {
          fireHaptic("error")
          return false
        }

        fireHaptic("success")
        router.back()
        return true
      } finally {
        setIsSaving(false)
      }
    },
    [date, isSaving, router, saveAvailabilityOverride],
  )

  const handleSave = useCallback(async () => {
    await persistOverride({
      nextEndTime: endTime,
      nextNote: note.trim() || undefined,
      nextStartTime: startTime,
      nextStatus: status,
    })
  }, [endTime, note, persistOverride, startTime, status])

  const handleResetToTemplate = useCallback(async () => {
    await persistOverride({
      nextEndTime: templateDay.endTime,
      nextStartTime: templateDay.startTime,
      nextStatus: templateDay.status,
    })
  }, [persistOverride, templateDay.endTime, templateDay.startTime, templateDay.status])

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
          label: "Save",
          onPress: () => {
            void handleSave()
          },
        },
      }),
    )
  }, [handleSave, isSaving, navigation, router, theme])

  useLayoutEffect(() => {
    if (!timeNonce || !isAvailabilityTimeField(timeField) || !timeValue) {
      return
    }

    updateTimeValue(timeField, timeValue)
    router.setParams({
      timeField: undefined,
      timeNonce: undefined,
      timeValue: undefined,
    })
  }, [router, timeField, timeNonce, timeValue, updateTimeValue])

  const handleAndroidTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (event.type !== "set" || !selectedDate || !activeTimeField) {
        setActiveTimeField(null)
        return
      }

      const nextValue = formatTime(
        selectedDate.getHours(),
        nearestMinute(selectedDate.getMinutes()),
      )
      updateTimeValue(activeTimeField, nextValue)
      setActiveTimeField(null)
    },
    [activeTimeField, updateTimeValue],
  )

  const handleTimePress = useCallback(
    (field: AvailabilityTimeField) => {
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
    },
    [date, endTime, router, startTime],
  )

  return {
    activeTimeField,
    canResetToTemplate: Boolean(existingOverride),
    date,
    endTime,
    existingOverride,
    handleAndroidTimeChange,
    handleResetToTemplate,
    handleTimePress,
    isSaving,
    note,
    pickerValue,
    setNote,
    setStatus,
    startTime,
    status,
    templateDay,
    weekdayLabel,
  }
}
