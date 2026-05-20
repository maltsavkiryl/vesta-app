import { useCallback, useLayoutEffect, useState } from "react"
import { Platform } from "react-native"
import { useRouter } from "expo-router"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

import {
  formatTime,
  isAvailabilityTimeField,
  nearestMinute,
  type AvailabilityTimeField,
} from "@/features/schedule/availability.utils"

type AvailabilityTimeRouteState = {
  timeField?: string
  timeNonce?: string
  timeValue?: string
}

export function useAvailabilityTimeFieldController({
  date,
  endTime,
  routeState,
  startTime,
  updateTimeValue,
}: {
  date: string
  endTime: string
  routeState: AvailabilityTimeRouteState
  startTime: string
  updateTimeValue: (field: AvailabilityTimeField, nextValue: string) => void
}) {
  const router = useRouter()
  const [activeTimeField, setActiveTimeField] = useState<AvailabilityTimeField | null>(null)
  const pickerValue = activeTimeField === "endTime" ? endTime : startTime

  useLayoutEffect(() => {
    if (
      !routeState.timeNonce ||
      !isAvailabilityTimeField(routeState.timeField) ||
      !routeState.timeValue
    ) {
      return
    }

    updateTimeValue(routeState.timeField, routeState.timeValue)
    router.setParams({
      timeField: undefined,
      timeNonce: undefined,
      timeValue: undefined,
    })
  }, [routeState.timeField, routeState.timeNonce, routeState.timeValue, router, updateTimeValue])

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
    handleAndroidTimeChange,
    handleTimePress,
    pickerValue,
  }
}
