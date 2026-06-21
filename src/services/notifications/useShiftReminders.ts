import { useEffect } from "react"

import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { useAppSession } from "@/providers/app-provider"

import { syncShiftReminders } from "./shiftReminders"

/**
 * Keeps local "shift starting soon" reminders in sync with the signed-in
 * employee's roster. Re-syncs whenever the schedule changes.
 */
export function useShiftReminders(): void {
  const { isSignedIn } = useAppSession()
  const { state } = useScheduleStateQuery()
  const shifts = state?.shifts

  useEffect(() => {
    if (!isSignedIn || !shifts) return
    void syncShiftReminders(shifts)
  }, [isSignedIn, shifts])
}
