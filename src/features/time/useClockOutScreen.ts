import { useState } from "react"
import { useRouter } from "expo-router"

import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { formatCurrency } from "@/core/format"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useClockSummary, useTimeDataQuery } from "@/features/time/data/time.queries"
import { fireHaptic } from "@/utils/haptics"

import { captureLocationSnapshot } from "./timeCapture"

export function useClockOutScreen() {
  const router = useRouter()
  const { confirmClockOut } = useTimeActions()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  // Real, per-employee pay rate sourced from the time overview earnings summary.
  const hourlyRate = query.data?.earnings.averageHourlyRate ?? 0
  const summary = useClockSummary()
  const [confirmed, setConfirmed] = useState(false)

  if (!clockSession) {
    return {
      clockSession,
      confirmed,
      handleFinish: async () => {},
      summary: null,
    }
  }

  const netSeconds = Math.max(summary.payableSeconds, 0)
  const workedLabel = formatDurationLabel(netSeconds)
  const earnings = formatCurrency((netSeconds / 3600) * hourlyRate)
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
    setConfirmed(true)
    setTimeout(() => router.replace("/(app)/(tabs)/time"), 900)
  }

  return {
    clockSession,
    confirmed,
    handleFinish,
    summary: {
      breakLabel: formatDurationLabel(summary.breakSeconds),
      clockOutTime: formatTimeLabel(new Date()),
      earnings,
      overtime,
      rateLabel: `${formatCurrency(hourlyRate)}/hr`,
      startedAtLabel: summary.startedAtLabel ?? "--:--",
      workedLabel,
    },
  }
}
