import { format } from "date-fns"

import { formatCurrency } from "@/utils/formatters"

import { formatDurationLabel } from "./date"
import type {
  ClockSession,
  LocationSnapshot,
  TimeEntry,
  TimeEntryEvent,
  TimeEntryEventType,
} from "./models"

const DEFAULT_HOURLY_RATE = 12.02

export interface TimeEntryBreakSegment {
  id: string
  startEvent: TimeEntryEvent
  endEvent?: TimeEntryEvent
  durationSeconds: number
}

export function buildTimeEntryEvent({
  location,
  occurredAt,
  type,
}: {
  location?: LocationSnapshot
  occurredAt: string
  type: TimeEntryEventType
}): TimeEntryEvent {
  return {
    id: `${type}-${occurredAt}`,
    type,
    occurredAt,
    location,
  }
}

export function getTimeEntryEventsSorted(events: TimeEntryEvent[]) {
  return [...events].sort(
    (left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
  )
}

export function buildTimeEntryFromClockSession({
  clockOutAt,
  clockOutLocation,
  clockSession,
  hourlyRate = DEFAULT_HOURLY_RATE,
}: {
  clockSession: ClockSession
  clockOutAt: string
  clockOutLocation?: LocationSnapshot
  hourlyRate?: number
}): TimeEntry {
  const clockOutEvent = buildTimeEntryEvent({
    location: clockOutLocation,
    occurredAt: clockOutAt,
    type: "clockOut",
  })
  const events = getTimeEntryEventsSorted([...clockSession.events, clockOutEvent])
  const startedAt = clockSession.startedAt ? new Date(clockSession.startedAt).getTime() : Date.now()
  const endedAt = new Date(clockOutAt).getTime()
  const grossSeconds = Math.max(Math.floor((endedAt - startedAt) / 1000), 0)
  const breakSeconds = getBreakSegments(events).reduce(
    (sum, segment) => sum + segment.durationSeconds,
    0,
  )
  const workedSeconds = Math.max(grossSeconds - breakSeconds, 0)

  return {
    id: `time-${clockOutAt}`,
    date: format(new Date(startedAt), "yyyy-MM-dd"),
    shiftLabel: "Clocked shift",
    venueName: clockSession.venueName,
    venueAddress: clockSession.venueAddress,
    clockInAt: clockSession.startedAt ?? clockOutAt,
    clockOutAt,
    grossSeconds,
    workedSeconds,
    breakSeconds,
    earningsAmount: (workedSeconds / 3600) * hourlyRate,
    status: "review",
    events,
    clockInProofPhoto: clockSession.clockInProofPhoto,
  }
}

export function getTimeEntryTimeRangeLabel(entry: TimeEntry) {
  return `${format(new Date(entry.clockInAt), "HH:mm")} - ${format(new Date(entry.clockOutAt), "HH:mm")}`
}

export function getTimeEntryWorkedLabel(entry: TimeEntry) {
  return formatDurationLabel(entry.workedSeconds)
}

export function getTimeEntryBreakLabel(entry: TimeEntry) {
  return formatDurationLabel(entry.breakSeconds)
}

export function getTimeEntryGrossLabel(entry: TimeEntry) {
  return formatDurationLabel(entry.grossSeconds)
}

export function getTimeEntryEarningsLabel(entry: TimeEntry) {
  return formatCurrency(entry.earningsAmount)
}

export function getTimeEntryPrimaryLocation(entry: TimeEntry) {
  return entry.events.find((event) => event.location)?.location
}

export function getTimeEntryMapRegion(entry: TimeEntry) {
  const points = entry.events
    .map((event) => event.location)
    .filter((location): location is LocationSnapshot => Boolean(location))

  if (points.length === 0) return null

  const latitudes = points.map((point) => point.latitude)
  const longitudes = points.map((point) => point.longitude)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max(maxLatitude - minLatitude, 0.01) * 1.8,
    longitudeDelta: Math.max(maxLongitude - minLongitude, 0.01) * 1.8,
  }
}

export function getBreakSegments(events: TimeEntryEvent[]): TimeEntryBreakSegment[] {
  const sortedEvents = getTimeEntryEventsSorted(events)
  const segments: TimeEntryBreakSegment[] = []
  let activeBreakStart: TimeEntryEvent | null = null

  for (const event of sortedEvents) {
    if (event.type === "breakStart") {
      activeBreakStart = event
      continue
    }

    if (event.type === "breakEnd" && activeBreakStart) {
      const startEvent = activeBreakStart
      segments.push({
        id: `${startEvent.id}-${event.id}`,
        startEvent,
        endEvent: event,
        durationSeconds: Math.max(
          Math.floor(
            (new Date(event.occurredAt).getTime() - new Date(startEvent.occurredAt).getTime()) /
              1000,
          ),
          0,
        ),
      })
      activeBreakStart = null
    }
  }

  if (activeBreakStart) {
    segments.push({
      id: `${activeBreakStart.id}-open`,
      startEvent: activeBreakStart,
      durationSeconds: 0,
    })
  }

  return segments
}

export function getTimeEntryEventLabel(type: TimeEntryEventType) {
  switch (type) {
    case "clockIn":
      return "Clocked in"
    case "breakStart":
      return "Break started"
    case "breakEnd":
      return "Back to work"
    case "clockOut":
      return "Clocked out"
    default:
      return type
  }
}
