import { useCallback } from "react"
import { useRouter } from "expo-router"

import type { TimeEntry } from "@/core/models"
import { useTimeCardController } from "@/features/time/useTimeCardController"

export function useTimeScreen() {
  const router = useRouter()
  const timeCard = useTimeCardController()
  const openEntry = useCallback(
    (entry: TimeEntry) => router.push(`/(app)/time-entry/${entry.id}` as never),
    [router],
  )

  return {
    ...timeCard,
    openEntry,
    openTimeEntries: () => router.push("/(app)/time-entries" as never),
  }
}
