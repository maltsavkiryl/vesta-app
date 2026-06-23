/**
 * Offline clock-punch queue. When a punch can't reach the server (no signal),
 * it's persisted and replayed in order once connectivity returns. Each queued
 * punch carries its real occurredAtUtc, so the backend records it at the time it
 * actually happened, not when it finally syncs.
 *
 * This is now a thin specialization of the generic offline mutation outbox
 * ({@link createOfflineMutationQueue}); the queue mechanics live there so other
 * features can reuse them. The storage key is unchanged so queues persisted by
 * earlier app versions still drain after this refactor.
 */
import type { HttpClient } from "@/services/api/httpClient"
import {
  createOfflineMutationQueue,
  isOfflineFailure,
  type QueuedMutation,
} from "@/services/offline/offlineMutationQueue"

import type { EmployeePunchBody } from "./time.dto"

export type ClockPunchAction = "clock-in" | "clock-out" | "break-start" | "break-end"

export type QueuedPunch = QueuedMutation<ClockPunchAction, EmployeePunchBody>

export const ENDPOINT: Record<ClockPunchAction, string> = {
  "clock-in": "/employee/timer/clock-in",
  "clock-out": "/employee/timer/clock-out",
  "break-start": "/employee/timer/break/start",
  "break-end": "/employee/timer/break/end",
}

const clockQueue = createOfflineMutationQueue<ClockPunchAction, EmployeePunchBody>({
  storageKey: "vesta.clock-queue",
  endpointFor: (action) => ENDPOINT[action],
})

export function loadClockQueue(): QueuedPunch[] {
  return clockQueue.load()
}

export function enqueuePunch(punch: QueuedPunch): void {
  clockQueue.enqueue(punch)
}

export function hasQueuedPunches(): boolean {
  return clockQueue.hasQueued()
}

export function flushClockQueue(http: HttpClient): Promise<boolean> {
  return clockQueue.flush(http)
}

export { isOfflineFailure }
