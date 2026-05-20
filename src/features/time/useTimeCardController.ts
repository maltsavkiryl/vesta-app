import { useEffect, useMemo, useState } from "react"
import { useRouter } from "expo-router"

import { getClockSnapshot } from "@/core/date"
import { createInitialState } from "@/core/mockState"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import type { IdleClockCardState } from "@/features/time/components/timeOverview.types"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import { formatClockStartDistance, resolveClockStart } from "@/features/time/data/time.workflow"
import { fireHaptic } from "@/utils/haptics"

import { useTimeClockActions } from "./useTimeClockActions"

function getPlannedDurationLabel(start: string, end: string) {
  const [startHours, startMinutes] = start.split(":").map(Number)
  const [endHours, endMinutes] = end.split(":").map(Number)
  let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
  if (durationMinutes < 0) durationMinutes += 24 * 60
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function getClockInOpenLabel(start: string) {
  const [hours, minutes] = start.split(":").map(Number)
  const totalMinutes = (hours * 60 + minutes + 24 * 60 - 15) % (24 * 60)
  const nextHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
  const nextMinutes = String(totalMinutes % 60).padStart(2, "0")
  return `${nextHours}:${nextMinutes}`
}

function buildIdleClockCardState(
  resolution: ReturnType<typeof resolveClockStart>,
): IdleClockCardState {
  if (!resolution.ok) {
    return {
      actionLabel: "Unavailable",
      detailLabel: "No workplace configured for manual timer starts",
      disabled: true,
      helperLabel: "Ask your employer to enable timer starts without a scheduled shift.",
      kind: "unavailable",
      subtitle: "Clock-in is only available when one of your linked employers allows it.",
      title: "No workplace available",
    }
  }

  const { mode, recommendedOption } = resolution.data

  if (
    mode === "shift" &&
    recommendedOption.context.scheduledStart &&
    recommendedOption.context.scheduledEnd
  ) {
    return {
      actionLabel: "Clock in",
      detailLabel: `${recommendedOption.context.venueName} · ${recommendedOption.context.venueAddress}`,
      helperLabel: `Clock-in opens at ${getClockInOpenLabel(recommendedOption.context.scheduledStart)}`,
      kind: "shift",
      subtitle: `${recommendedOption.context.role ?? "Scheduled shift"} · ${getPlannedDurationLabel(
        recommendedOption.context.scheduledStart,
        recommendedOption.context.scheduledEnd,
      )} planned`,
      title: `${recommendedOption.context.scheduledStart} - ${recommendedOption.context.scheduledEnd}`,
    }
  }

  if (mode === "single-employer") {
    return {
      actionLabel: "Start timer",
      detailLabel: `${recommendedOption.context.venueName} · ${recommendedOption.locationLabel}`,
      helperLabel: "No scheduled shift is needed for this workplace.",
      kind: "single-employer",
      subtitle: "Start logging time even when you do not have a scheduled shift.",
      title: recommendedOption.context.venueName,
    }
  }

  const distanceLabel = recommendedOption.inGeofence
    ? "In geofence"
    : formatClockStartDistance(recommendedOption.distanceMeters)

  return {
    actionLabel: "Start timer",
    detailLabel: `${recommendedOption.context.venueName} · ${recommendedOption.locationLabel}`,
    helperLabel: distanceLabel
      ? `${distanceLabel}. Closest linked workplace is suggested first.`
      : "Closest linked workplace is suggested first.",
    kind: "multiple-employers",
    subtitle: "Choose a workplace, then start logging time without a scheduled shift.",
    title: recommendedOption.context.venueName,
  }
}

export function useTimeCardController() {
  const router = useRouter()
  const { endBreak, startBreak, startClock } = useTimeActions()
  const query = useTimeDataQuery()
  const scheduleQuery = useScheduleStateQuery()
  const profileQuery = useProfileStateQuery()
  const fallbackState = useMemo(() => createInitialState(), [])
  const state = query.data ?? {
    clockSession: fallbackState.clockSession,
    earnings: fallbackState.earnings,
    timeEntries: fallbackState.timeEntries,
  }
  const employers = profileQuery.state?.employers ?? fallbackState.employers
  const profileRole = profileQuery.profile?.role ?? fallbackState.profile.role
  const shifts = scheduleQuery.state?.shifts ?? fallbackState.shifts
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (state.clockSession.state === "idle") return
    const intervalId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [state.clockSession.state])

  const snapshot = useMemo(
    () => getClockSnapshot(state.clockSession, now),
    [now, state.clockSession],
  )
  const elapsedSeconds = state.clockSession.startedAt
    ? Math.max(
        Math.floor((now.getTime() - new Date(state.clockSession.startedAt).getTime()) / 1000),
        0,
      )
    : 0
  const totalBreakSeconds = snapshot.breakSeconds
  const idleState = useMemo(
    () => buildIdleClockCardState(resolveClockStart({ employers, profileRole, shifts })),
    [employers, profileRole, shifts],
  )
  const { handleClockIn, handleEndBreak, handleStartBreak } = useTimeClockActions({
    employers,
    endBreak,
    profileRole,
    shifts,
    startBreak,
    startClock,
  })

  return {
    elapsedSeconds,
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
    idleState,
    openClockOut: () => {
      fireHaptic("selection")
      router.push("/(app)/clock-out" as never)
    },
    snapshot,
    state,
    totalBreakSeconds,
  }
}
