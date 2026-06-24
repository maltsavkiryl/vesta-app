import { formatFullDate, formatShortDate, getLocalToday, getShiftTimeRange } from "@/core/date"
import type { RequestCategory, Shift } from "@/core/models"
import { translate } from "@/i18n/translate"

export function formatRequestDateListLabel(dates: string[]) {
  if (dates.length === 0) return ""
  if (dates.length === 1) return formatShortDate(dates[0])
  const sorted = [...dates].sort((left, right) => left.localeCompare(right))
  return `${formatShortDate(sorted[0] ?? "")} - ${formatShortDate(sorted[sorted.length - 1] ?? "")}`
}

export function getTodayDateString() {
  return getLocalToday()
}

export function getTargetSectionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      sectionTitle: translate("planning:requestFlow.shiftSectionTitle"),
      subtitle: translate("planning:requestFlow.pickShiftHint"),
    }
  }

  if (category === "availability_issue") {
    return {
      sectionTitle: translate("planning:requestFlow.affectedDates"),
      subtitle: translate("planning:requestFlow.markDaysHint"),
    }
  }

  return {
    sectionTitle: translate("planning:requestFlow.datesSectionTitle"),
    subtitle: translate("planning:requestFlow.chooseDatesHint"),
  }
}

export function getRequestSuccessCopy(category: RequestCategory) {
  return category === "shift_change"
    ? translate("planning:requestFlow.swapSuccess")
    : translate("planning:requestFlow.datesSuccess")
}

export function getRequestActionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      reasonTitle: translate("planning:requestFlow.swapQuestion"),
      screenTitle: translate("planning:requestFlow.swapTitle"),
      submitLabel: translate("planning:requestFlow.swapCta"),
    }
  }

  if (category === "availability_issue") {
    return {
      reasonTitle: translate("planning:requestFlow.unavailabilityQuestion"),
      screenTitle: translate("planning:requestFlow.unavailabilityTitle"),
      submitLabel: translate("planning:requestFlow.unavailabilityCta"),
    }
  }

  return {
    reasonTitle: translate("planning:requestFlow.timeOffQuestion"),
    screenTitle: translate("planning:requestFlow.timeOffTitle"),
    submitLabel: translate("planning:requestFlow.timeOffCta"),
  }
}

export function getRequestSummaryTarget(
  category: RequestCategory,
  selectedDates: string[],
  selectedShift?: Shift,
) {
  return category === "shift_change"
    ? selectedShift
      ? `${selectedShift.dayLabel} · ${getShiftTimeRange(selectedShift)}`
      : ""
    : formatRequestDateListLabel(selectedDates)
}

export function getRequestDetailTargetLabel(
  category: RequestCategory,
  selectedDates: string[],
  selectedShift?: Shift,
) {
  if (category === "shift_change") {
    return selectedShift ? `${selectedShift.role} · ${selectedShift.venueName}` : ""
  }

  if (selectedDates.length === 1) {
    return formatFullDate(selectedDates[0] ?? "")
  }

  return selectedDates.length > 1 ? `${selectedDates.length} dates selected` : ""
}
