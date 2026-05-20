import { useCallback, useLayoutEffect, useState } from "react"
import { Platform } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

import type { AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"
import {
  formatTime,
  isAvailabilityTimeField,
  nearestMinute,
  type AvailabilityTimeField,
} from "@/features/schedule/availability.utils"
import {
  getAvailabilityTemplateDay,
  getFallbackAvailabilityTemplate,
} from "@/features/schedule/availability-template.utils"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { createHeaderActionOptions, useAppTheme } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

type AvailabilityTemplateDayRouteParams = {
  day?: string; timeField?: string; timeNonce?: string; timeValue?: string
}

export function useAvailabilityTemplateDayScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useAppTheme()
  const { state } = useScheduleStateQuery()
  const { saveAvailabilityTemplate } = useScheduleActions()
  const {
    day: rawDay,
    timeField,
    timeNonce,
    timeValue,
  } = useLocalSearchParams<AvailabilityTemplateDayRouteParams>()
  const day = getAvailabilityTemplateDay(rawDay)
  const template = state?.availabilityTemplate ?? getFallbackAvailabilityTemplate()
  const [editedRule, setEditedRule] = useState(template[day])
  const [activeTimeField, setActiveTimeField] = useState<AvailabilityTimeField | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pickerValue = activeTimeField === "endTime" ? editedRule.endTime : editedRule.startTime

  useLayoutEffect(() => {
    setEditedRule(template[day])
  }, [day, template])

  const updateRule = useCallback((updater: (current: AvailabilityTemplate[AvailabilityWeekday]) => AvailabilityTemplate[AvailabilityWeekday]) => {
    setEditedRule((current) => updater(current))
  }, [])

  const updateTimeValue = useCallback(
    (field: AvailabilityTimeField, nextValue: string) => {
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
          onPress: () => router.back(),
        },
        right: {
          disabled: isSaving,
          kind: "confirm",
          haptic: "none",
          onPress: () => void handleSave(),
        },
      }),
    )
  }, [handleSave, isSaving, navigation, router, theme])

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
            day,
            field,
            returnTo: "availability-template-day",
            title: field === "startTime" ? "Choose start time" : "Choose end time",
            value: field === "startTime" ? editedRule.startTime : editedRule.endTime,
          },
          pathname: "/(app)/availability-time-picker",
        })
        return
      }

      setActiveTimeField(field)
    },
    [day, editedRule.endTime, editedRule.startTime, router],
  )

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

  return {
    activeTimeField,
    day,
    editedRule,
    handleAndroidTimeChange,
    handleTimePress,
    pickerValue,
    setStatus: (status: AvailabilityTemplate[AvailabilityWeekday]["status"]) => {
      updateRule((current) => ({ ...current, status }))
    },
  }
}
