import { useMemo } from "react"
import { format } from "date-fns"

import { formatTimeLabel, getClockSnapshot } from "@/core/date"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

export function useTimeDataQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => ({
    clockSession: state.clockSession,
    earnings: state.earnings,
    timeEntries: state.timeEntries,
  }))
}

export function useClockSessionQuery() {
  const query = useTimeDataQuery()
  return useMemo(() => query.data?.clockSession, [query.data])
}

export function useClockSummary(now: Date = new Date()) {
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession

  return useMemo(() => {
    if (!clockSession) {
      return {
        breakMinutes: 0,
        breakSeconds: 0,
        payableSeconds: 0,
        startedAtLabel: undefined,
        totalLabel: "",
        workedLabel: "0h 0m",
      }
    }

    const snapshot = getClockSnapshot(clockSession, now)
    return {
      ...snapshot,
      startedAtLabel: clockSession.startedAt
        ? formatTimeLabel(new Date(clockSession.startedAt))
        : undefined,
      breakMinutes: Math.floor(snapshot.breakSeconds / 60),
      workedLabel: `${Math.floor(snapshot.payableSeconds / 3600)}h ${Math.floor(
        (snapshot.payableSeconds % 3600) / 60,
      )}m`,
      totalLabel: format(now, "EEEE, MMM d"),
    }
  }, [clockSession, now])
}
