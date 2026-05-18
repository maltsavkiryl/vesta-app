import { format } from "date-fns"

import type { ClockSession, Shift } from "./models"

export function parseDateValue(value: string | Date | number) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatFullDate(dateString: string) {
  const date = parseDateValue(dateString)
  return date ? format(date, "EEEE, MMMM d") : "Unknown date"
}

export function formatShortDate(dateString: string) {
  const date = parseDateValue(dateString)
  return date ? format(date, "MMM d") : "Unknown date"
}

export function formatMonthLabel(dateString: string) {
  const date = parseDateValue(dateString)
  return date ? format(date, "MMMM yyyy") : "Unknown month"
}

export function formatTimeLabel(date: Date) {
  return format(date, "HH:mm")
}

export function formatTimeValue(value: string | Date | number, fallback = "--:--") {
  const date = parseDateValue(value)
  return date ? format(date, "HH:mm") : fallback
}

export function formatDurationLabel(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

export function getShiftTimeRange(shift: Shift) {
  return `${shift.startTime} - ${shift.endTime}`
}

export function getClockSnapshot(clockSession: ClockSession, now: Date) {
  if (!clockSession.startedAt) {
    return {
      workedSeconds: 0,
      breakSeconds: clockSession.accumulatedBreakSeconds,
      payableSeconds: 0,
    }
  }

  const startedAt = new Date(clockSession.startedAt).getTime()
  const breakStartedAt = clockSession.breakStartedAt
    ? new Date(clockSession.breakStartedAt).getTime()
    : undefined

  const elapsedSeconds = Math.max(Math.floor((now.getTime() - startedAt) / 1000), 0)
  const activeBreakSeconds =
    clockSession.state === "onBreak" && breakStartedAt
      ? Math.max(Math.floor((now.getTime() - breakStartedAt) / 1000), 0)
      : 0
  const breakSeconds = clockSession.accumulatedBreakSeconds + activeBreakSeconds

  return {
    workedSeconds: elapsedSeconds,
    breakSeconds,
    payableSeconds: Math.max(elapsedSeconds - breakSeconds, 0),
  }
}
