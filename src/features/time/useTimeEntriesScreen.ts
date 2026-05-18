import { useMemo } from "react"
import { useRouter } from "expo-router"

import { formatMonthLabel } from "@/core/date"
import type { TimeEntry } from "@/core/models"
import { useTimeDataQuery } from "@/features/time/data/time.queries"

export function useTimeEntriesScreen() {
  const router = useRouter()
  const query = useTimeDataQuery()
  const timeEntries = useMemo(() => query.data?.timeEntries ?? [], [query.data?.timeEntries])

  const groupedEntries = useMemo(
    () =>
      timeEntries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
        const month = formatMonthLabel(entry.date)
        acc[month] = [...(acc[month] ?? []), entry]
        return acc
      }, {}),
    [timeEntries],
  )

  return {
    groupedEntries,
    openEntry: (entry: TimeEntry) => router.push(`/(app)/time-entry/${entry.id}` as never),
    state: {
      timeEntries,
    },
  }
}
