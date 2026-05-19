import type { AvailabilityStatus } from "@/core/models"

export const TIME_REFERENCE_DATE = "2026-01-01"
export type AvailabilityTimeField = "startTime" | "endTime"

export const availabilityStatusOptions: Record<
  AvailabilityStatus,
  { label: string; description: string; tone: "dark" | "success" | "accent" }
> = {
  unavailable: { label: "Unavailable", description: "Day off", tone: "dark" },
  available: { label: "Available", description: "Can work if needed", tone: "success" },
  preferred: { label: "Preferred", description: "Best day for me to work", tone: "accent" },
}

export function nearestMinute(minute: number) {
  const options = [0, 15, 30, 45]
  const closest = options.reduce((current, candidate) =>
    Math.abs(candidate - minute) < Math.abs(current - minute) ? candidate : current,
  )
  return String(closest).padStart(2, "0")
}

export function parseTime(value: string): [number, string] {
  const [hour, minute = "0"] = value.split(":")
  return [Number.parseInt(hour, 10) || 0, nearestMinute(Number.parseInt(minute, 10) || 0)]
}

export function formatTime(hour: number, minute: string) {
  return `${String((hour + 24) % 24).padStart(2, "0")}:${minute}`
}

export function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timeValueToDate(value))
}

export function isAvailabilityTimeField(value?: string): value is AvailabilityTimeField {
  return value === "startTime" || value === "endTime"
}

export function timeValueToDate(value: string) {
  const [hour, minute] = parseTime(value)
  return new Date(`${TIME_REFERENCE_DATE}T${String(hour).padStart(2, "0")}:${minute}:00`)
}

export function durationLabel(startTime: string, endTime: string) {
  const [startHour, startMinute] = parseTime(startTime)
  const [endHour, endMinute] = parseTime(endTime)
  const start = startHour * 60 + Number(startMinute)
  let end = endHour * 60 + Number(endMinute)
  if (end <= start) end += 24 * 60

  const minutes = end - start
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`
}
