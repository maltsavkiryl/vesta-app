import { useLocalSearchParams } from "expo-router"

import {
  getBreakSegments,
  getTimeEntryEventsSorted,
  getTimeEntryMapRegion,
  getTimeEntryPrimaryLocation,
} from "@/core/timeEntries"
import { useTimeDataQuery } from "@/features/time/data/time.queries"

export function useTimeEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useTimeDataQuery()
  const entry = query.data?.timeEntries.find((candidate) => candidate.id === id)

  if (!entry) {
    return {
      breakSegments: [],
      entry,
      mapRegion: null,
      primaryLocation: null,
      sortedEvents: [],
    }
  }

  return {
    breakSegments: getBreakSegments(entry.events),
    entry,
    mapRegion: getTimeEntryMapRegion(entry),
    primaryLocation: getTimeEntryPrimaryLocation(entry),
    sortedEvents: getTimeEntryEventsSorted(entry.events),
  }
}
