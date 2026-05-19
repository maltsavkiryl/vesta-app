import { Ionicons } from "@expo/vector-icons"
import type { SFSymbol } from "sf-symbols-typescript"

import type { RequestCategory, RequestType } from "@/core/models"

type RequestCategoryTone = "accent" | "warning" | "danger"

export type RequestCategoryConfig = {
  description: string
  icon: keyof typeof Ionicons.glyphMap
  reasonPresets: string[]
  systemImage: SFSymbol
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
    description: "Request one or more days off",
    icon: "calendar-clear-outline",
    reasonPresets: ["Personal", "Medical", "Family", "Travel"],
    systemImage: "calendar.badge.plus",
    title: "Time off",
    tone: "accent",
    type: "Time off",
  },
  shift_change: {
    description: "Ask for help with a scheduled shift",
    icon: "swap-horizontal-outline",
    reasonPresets: ["Running late", "Need replacement", "Schedule conflict", "Transport issue"],
    systemImage: "arrow.left.arrow.right.circle",
    title: "Shift change",
    tone: "warning",
    type: "Shift swap",
  },
  availability_issue: {
    description: "Flag an availability conflict or exception",
    icon: "alert-circle-outline",
    reasonPresets: [
      "Class or exam",
      "Family commitment",
      "Existing appointment",
      "Unexpected conflict",
    ],
    systemImage: "exclamationmark.circle",
    title: "Availability issue",
    tone: "danger",
    type: "Unavailability",
  },
}

export function isRequestCategory(value: string | undefined): value is RequestCategory {
  return Boolean(value && value in requestCategoryConfig)
}
