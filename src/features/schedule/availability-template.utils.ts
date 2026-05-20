import type { AvailabilityStatus, AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"

import { formatTimeLabel } from "@/features/schedule/availability.utils"
import { availabilityWeekdays } from "@/features/schedule/schedule.utils"

export function getFallbackAvailabilityTemplate(): AvailabilityTemplate {
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

export function getAvailabilityTemplateDay(value?: string): AvailabilityWeekday {
  return value && availabilityWeekdays.includes(value as AvailabilityWeekday)
    ? (value as AvailabilityWeekday)
    : "monday"
}

export function getAvailabilityTemplateSummary(day: AvailabilityTemplate[AvailabilityWeekday]) {
  if (day.status === "unavailable") {
    return "Not available for work"
  }

  return `${formatTimeLabel(day.startTime)} to ${formatTimeLabel(day.endTime)}`
}

export function getAvailabilityTemplateStatusTone(
  status: AvailabilityStatus,
  colors: {
    accent: string
    success: string
    textMuted: string
  },
) {
  switch (status) {
    case "available":
      return colors.success
    case "preferred":
      return colors.accent
    case "unavailable":
      return colors.textMuted
  }
}
