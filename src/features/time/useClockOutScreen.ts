import { useState } from "react"
import { useRouter } from "expo-router"

import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useClockSummary, useTimeDataQuery } from "@/features/time/data/time.queries"
import { fireHaptic } from "@/utils/haptics"

import { captureLocationSnapshot } from "./timeCapture"

// Hours past which we surface an overtime callout on the clock-out summary.
const OVERTIME_THRESHOLD_SECONDS = 6 * 3600

export function useClockOutScreen() {
  const router = useRouter()
  const { confirmClockOut } = useTimeActions()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  const summary = useClockSummary()
  const [confirmed, setConfirmed] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleDismiss = () => {
    router.replace("/(app)/(tabs)/time")
  }

  if (!clockSession) {
    return {
      celebration: null,
      clockSession,
      confirmed,
      error: undefined,
      handleDismiss,
      handleFinish: async () => {},
      isFinishing: false,
      summary: null,
    }
  }

  const netSeconds = Math.max(summary.payableSeconds, 0)
  const workedLabel = formatDurationLabel(netSeconds)
  const overtime =
    netSeconds > OVERTIME_THRESHOLD_SECONDS ? netSeconds - OVERTIME_THRESHOLD_SECONDS : 0

  const handleFinish = async () => {
    if (isFinishing) return
    setIsFinishing(true)
    setError(undefined)
    try {
      const occurredAt = new Date().toISOString()
      const location = await captureLocationSnapshot()
      const result = await confirmClockOut({ occurredAt, location })
      if (!result.ok) {
        fireHaptic("error")
        setError(result.error.message)
        return
      }

      fireHaptic("success")
      // No auto-redirect — the celebration is a moment the employee dismisses.
      setConfirmed(true)
    } finally {
      setIsFinishing(false)
    }
  }

  return {
    celebration: {
      breakLabel: formatDurationLabel(summary.breakSeconds),
      workedLabel,
    },
    clockSession,
    confirmed,
    error,
    handleDismiss,
    handleFinish,
    isFinishing,
    summary: {
      breakLabel: formatDurationLabel(summary.breakSeconds),
      clockOutTime: formatTimeLabel(new Date()),
      overtime,
      startedAtLabel: summary.startedAtLabel ?? "--:--",
      workedLabel,
    },
  }
}
