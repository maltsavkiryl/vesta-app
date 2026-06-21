import { useEffect, useRef } from "react"

import { useClockSessionQuery } from "@/features/time/data/time.queries"
import { useAppSession } from "@/providers/app-provider"

import {
  createClockLiveActivityPayload,
  endClockLiveActivity,
  startClockLiveActivity,
  updateClockLiveActivity,
} from "./clockLiveActivity"

/**
 * Mirrors the active clock session into an iOS Live Activity: starts one when a
 * shift begins, updates it on break transitions, and ends it on clock-out. The
 * underlying bridge no-ops on Android and when the native module is unavailable,
 * so this is safe to mount everywhere.
 */
export function useClockLiveActivitySync(): void {
  const { isSignedIn } = useAppSession()
  const clockSession = useClockSessionQuery()
  const activeSessionId = useRef<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) return
    const payload = clockSession ? createClockLiveActivityPayload(clockSession) : null

    if (!payload) {
      if (activeSessionId.current) {
        void endClockLiveActivity(activeSessionId.current)
        activeSessionId.current = null
      }
      return
    }

    if (activeSessionId.current !== payload.sessionId) {
      // A new (or first) session — end any stale one, then start fresh.
      if (activeSessionId.current) void endClockLiveActivity(activeSessionId.current)
      void startClockLiveActivity(payload)
      activeSessionId.current = payload.sessionId
    } else {
      void updateClockLiveActivity(payload)
    }
  }, [isSignedIn, clockSession])
}
