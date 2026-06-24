import type { ButtonProps } from "@expo/ui/swift-ui"
import { Ionicons } from "@expo/vector-icons"

import type { RequestCategory, RequestType } from "@/core/models"
import { translate } from "@/i18n/translate"

type RequestCategoryTone = "accent" | "warning" | "danger"
type SystemImageName = NonNullable<ButtonProps["systemImage"]>

export type RequestCategoryConfig = {
  description: string
  icon: keyof typeof Ionicons.glyphMap
  reasonPresets: string[]
  systemImage: SystemImageName
  title: string
  tone: RequestCategoryTone
  type: RequestType
}

export const requestCategoryOrder: RequestCategory[] = [
  "time_off",
  "shift_change",
  "availability_issue",
]

export const requestCategoryConfig: Record<RequestCategory, RequestCategoryConfig> = {
  time_off: {
    description: translate("planning:requestCategories.timeOffDesc"),
    icon: "calendar-clear-outline",
    reasonPresets: [
      translate("planning:reasonPresets.personal"),
      translate("planning:reasonPresets.medical"),
      translate("planning:reasonPresets.family"),
      translate("planning:reasonPresets.travel"),
    ],
    systemImage: "calendar.badge.plus",
    title: translate("planning:requestCategories.timeOffTitle"),
    tone: "accent",
    type: "Time off",
  },
  shift_change: {
    description: translate("planning:requestCategories.shiftChangeDesc"),
    icon: "swap-horizontal-outline",
    reasonPresets: [
      translate("planning:reasonPresets.runningLate"),
      translate("planning:reasonPresets.needReplacement"),
      translate("planning:reasonPresets.scheduleConflict"),
      translate("planning:reasonPresets.transportIssue"),
    ],
    systemImage: "arrow.left.arrow.right.circle",
    title: translate("planning:requestCategories.shiftChangeTitle"),
    tone: "warning",
    type: "Shift swap",
  },
  availability_issue: {
    description: translate("planning:requestCategories.availabilityIssueDesc"),
    icon: "alert-circle-outline",
    reasonPresets: [
      translate("planning:reasonPresets.classExam"),
      translate("planning:reasonPresets.familyCommitment"),
      translate("planning:reasonPresets.existingAppointment"),
      translate("planning:reasonPresets.unexpectedConflict"),
    ],
    systemImage: "exclamationmark.circle",
    title: translate("planning:requestCategories.availabilityIssueTitle"),
    tone: "danger",
    type: "Unavailability",
  },
}

export function isRequestCategory(value: string | undefined): value is RequestCategory {
  return Boolean(value && value in requestCategoryConfig)
}
