import { format } from "date-fns"

import { getDateFnsLocale, resolveSupportedLocale, type SupportedLocale } from "./format"
import type { ClockSession, Shift } from "./models"

export function parseDateValue(value: string | Date | number) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Resolves a value to a Date anchored in the LOCAL timezone. Bare
 * `yyyy-MM-dd` strings are parsed at local noon so the calendar day never
 * drifts across the UTC boundary (the bug this module fixes).
 */
export function resolveLocalDate(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12)
  }
  return parseDateValue(value)
}

/**
 * The user's "today" as a local `yyyy-MM-dd` string. Use this instead of
 * `new Date().toISOString().slice(0, 10)`, which reports the UTC day and so
 * flips a day early/late around local midnight (e.g. after ~22:00 in Belgium).
 */
export function getLocalToday(): string {
  return format(new Date(), "yyyy-MM-dd")
}

/**
 * Advance a local `yyyy-MM-dd` string by `days` days and return the result
 * as a local `yyyy-MM-dd` string. Parses at local noon so the intermediate
 * Date never drifts across the UTC boundary.
 */
export function addLocalDays(dateString: string, days: number): string {
  const date = resolveLocalDate(dateString) ?? new Date()
  date.setDate(date.getDate() + days)
  return format(date, "yyyy-MM-dd")
}

/**
 * Format a Date as a local `yyyy-MM-dd` string. Prefer this over
 * `date.toISOString().slice(0, 10)`, which returns the UTC date.
 */
export function formatLocalDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** True when the given date (local `yyyy-MM-dd` or ISO) is the local today. */
export function isToday(value: string): boolean {
  const date = resolveLocalDate(value)
  return date ? format(date, "yyyy-MM-dd") === getLocalToday() : false
}

const relativeDayCopy: Record<SupportedLocale, { today: string; tomorrow: string }> = {
  en: { today: "Today", tomorrow: "Tomorrow" },
  fr: { today: "Aujourd'hui", tomorrow: "Demain" },
  nl: { today: "Vandaag", tomorrow: "Morgen" },
}

/**
 * A localized relative label derived from a real date: "Today"/"Tomorrow" when
 * applicable, otherwise a short weekday + day (e.g. "Fri 19"). Prefer this over
 * the static, baked `Shift.dayLabel` when driving display from `shift.date`.
 */
export function getRelativeDayLabel(value: string, locale?: string): string {
  const date = resolveLocalDate(value)
  if (!date) return ""

  const key = format(date, "yyyy-MM-dd")
  const now = new Date()
  if (key === format(now, "yyyy-MM-dd")) {
    return relativeDayCopy[resolveSupportedLocale(locale)].today
  }

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (key === format(tomorrow, "yyyy-MM-dd")) {
    return relativeDayCopy[resolveSupportedLocale(locale)].tomorrow
  }

  return format(date, "EEE d", { locale: getDateFnsLocale(locale) })
}

export function formatFullDate(dateString: string) {
  const date = resolveLocalDate(dateString)
  return date ? format(date, "EEEE, MMMM d", { locale: getDateFnsLocale() }) : "Unknown date"
}

export function formatShortDate(dateString: string) {
  const date = resolveLocalDate(dateString)
  return date ? format(date, "MMM d", { locale: getDateFnsLocale() }) : "Unknown date"
}

export function formatMonthLabel(dateString: string) {
  const date = resolveLocalDate(dateString)
  return date ? format(date, "MMMM yyyy", { locale: getDateFnsLocale() }) : "Unknown month"
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
