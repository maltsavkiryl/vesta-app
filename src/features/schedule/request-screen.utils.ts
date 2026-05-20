import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestCategory, Shift } from "@/core/models"

export function formatRequestDateListLabel(dates: string[]) {
  if (dates.length === 0) return ""
  if (dates.length === 1) return formatShortDate(dates[0])
  const sorted = [...dates].sort((left, right) => left.localeCompare(right))
  return `${formatShortDate(sorted[0] ?? "")} - ${formatShortDate(sorted[sorted.length - 1] ?? "")}`
}

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function getTargetSectionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      sectionTitle: "Shift",
      subtitle: "Pick the exact shift that needs support so everyone reviews the right context.",
    }
  }

  if (category === "availability_issue") {
    return {
      sectionTitle: "Affected dates",
      subtitle: "Mark the days that no longer match your current availability.",
    }
  }

  return {
    sectionTitle: "Dates",
    subtitle: "Choose one or more dates so your manager can review the request quickly.",
  }
}

export function getRequestSuccessCopy(category: RequestCategory) {
  return category === "shift_change"
    ? "Your manager and the team coordinating replacements now have the shift details and reason."
    : "Your manager now has the dates and context they need to review this request."
}

export function getRequestActionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      reasonTitle: "Why do you need a swap?",
      screenTitle: "Shift swap",
      submitLabel: "Send shift swap",
    }
  }

  if (category === "availability_issue") {
    return {
      reasonTitle: "Why is your availability changing?",
      screenTitle: "Unavailability",
      submitLabel: "Send unavailability",
    }
  }

  return {
    reasonTitle: "Why do you need time off?",
    screenTitle: "Time off",
    submitLabel: "Send time off",
  }
}

export function getRequestSummaryTarget(category: RequestCategory, selectedDates: string[], selectedShift?: Shift) {
  return category === "shift_change"
    ? selectedShift
      ? `${selectedShift.dayLabel} · ${getShiftTimeRange(selectedShift)}`
      : ""
    : formatRequestDateListLabel(selectedDates)
}

export function getRequestDetailTargetLabel(category: RequestCategory, selectedDates: string[], selectedShift?: Shift) {
  if (category === "shift_change") {
    return selectedShift ? `${selectedShift.role} · ${selectedShift.venueName}` : ""
  }

  if (selectedDates.length === 1) {
    return formatFullDate(selectedDates[0] ?? "")
  }

  return selectedDates.length > 1 ? `${selectedDates.length} dates selected` : ""
}
