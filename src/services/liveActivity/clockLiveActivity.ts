import { NativeModules, Platform } from "react-native"

import type { ClockSession } from "@/core/models"

export interface ClockLiveActivityPayload {
  sessionId: string
  status: "working" | "onBreak"
  startedAt: string
  breakStartedAt?: string
  accumulatedBreakSeconds: number
  scheduledStart: string
  scheduledEnd: string
  role: string
  venueName: string
}

interface VestaLiveActivityModuleShape {
  isLiveActivitySupported(): Promise<boolean>
  startClockLiveActivity(payload: ClockLiveActivityPayload): Promise<string | null>
  updateClockLiveActivity(payload: ClockLiveActivityPayload): Promise<void>
  endClockLiveActivity(payload?: Pick<ClockLiveActivityPayload, "sessionId">): Promise<void>
}

const VestaLiveActivityModule = NativeModules.VestaLiveActivityModule as
  | VestaLiveActivityModuleShape
  | undefined

function getNativeLiveActivityModule() {
  if (Platform.OS !== "ios" || !VestaLiveActivityModule) {
    return null
  }

  return VestaLiveActivityModule
}

export function createClockLiveActivityPayload(
  clockSession: ClockSession,
): ClockLiveActivityPayload | null {
  if (clockSession.state === "idle" || !clockSession.startedAt) {
    return null
  }

  return {
    sessionId: clockSession.startedAt,
    status: clockSession.state,
    startedAt: clockSession.startedAt,
    breakStartedAt: clockSession.breakStartedAt,
    accumulatedBreakSeconds: clockSession.accumulatedBreakSeconds,
    scheduledStart: clockSession.scheduledStart ?? "--:--",
    scheduledEnd: clockSession.scheduledEnd ?? "--:--",
    role: clockSession.role ?? "Timer",
    venueName: clockSession.venueName,
  }
}

export async function isClockLiveActivitySupported() {
  const module = getNativeLiveActivityModule()
  if (!module) {
    return false
  }

  return module.isLiveActivitySupported()
}

export async function startClockLiveActivity(payload: ClockLiveActivityPayload) {
  const module = getNativeLiveActivityModule()
  if (!module) {
    return null
  }

  return module.startClockLiveActivity(payload)
}

export async function updateClockLiveActivity(payload: ClockLiveActivityPayload) {
  const module = getNativeLiveActivityModule()
  if (!module) {
    return
  }

  await module.updateClockLiveActivity(payload)
}

export async function endClockLiveActivity(sessionId?: string) {
  const module = getNativeLiveActivityModule()
  if (!module) {
    return
  }

  await module.endClockLiveActivity(sessionId ? { sessionId } : undefined)
}
