import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { appRepositories } from "@/composition/repositories"
import { formatTimeLabel, getClockSnapshot } from "@/core/date"
import { useAppSession } from "@/providers/app-provider"

export const timeQueryKeys = {
  detail: (accountId: string | null, entryId: string) =>
    ["time", accountId, "entry", entryId] as const,
  overview: (accountId: string | null) => ["time", accountId, "overview"] as const,
}

export function useTimeDataQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.time.getTimeOverview(accountId!),
    queryKey: timeQueryKeys.overview(accountId),
  })
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
