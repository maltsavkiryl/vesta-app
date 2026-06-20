import { useState } from "react"
import { useRouter } from "expo-router"

import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useClockSummary, useTimeDataQuery } from "@/features/time/data/time.queries"
import { fireHaptic } from "@/utils/haptics"

import { captureLocationSnapshot } from "./timeCapture"

export function useClockOutScreen() {
  const router = useRouter()
  const { confirmClockOut } = useTimeActions()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  const summary = useClockSummary()
  const [confirmed, setConfirmed] = useState(false)

  const handleDismiss = () => {
    router.replace("/(app)/(tabs)/time")
  }

  if (!clockSession) {
    return {
      celebration: null,
      clockSession,
      confirmed,
      handleDismiss,
      handleFinish: async () => {},
      summary: null,
    }
  }

  const netSeconds = Math.max(summary.payableSeconds, 0)
  const workedLabel = formatDurationLabel(netSeconds)
  const overtime = netSeconds > 6 * 3600 ? netSeconds - 6 * 3600 : 0

  const handleFinish = async () => {
    const occurredAt = new Date().toISOString()
    const location = await captureLocationSnapshot()
    const result = await confirmClockOut({ occurredAt, location })
    if (!result.ok) {
      fireHaptic("error")
      return
    }

    fireHaptic("success")
    // No auto-redirect — the celebration is a moment the employee dismisses.
    setConfirmed(true)
  }

  return {
    celebration: {
      breakLabel: formatDurationLabel(summary.breakSeconds),
      workedLabel,
    },
    clockSession,
    confirmed,
    handleDismiss,
    handleFinish,
    summary: {
      breakLabel: formatDurationLabel(summary.breakSeconds),
      clockOutTime: formatTimeLabel(new Date()),
      overtime,
      startedAtLabel: summary.startedAtLabel ?? "--:--",
      workedLabel,
    },
  }
}
