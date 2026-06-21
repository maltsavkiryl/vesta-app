/**
 * Offline clock-punch queue. When a punch can't reach the server (no signal),
 * it's persisted here and replayed in order once connectivity returns. Each
 * queued punch carries its real occurredAtUtc, so the backend records it at the
 * time it actually happened, not when it finally syncs.
 */
import type { HttpClient } from "@/services/api/httpClient"
import { load, remove, save } from "@/utils/storage"

import type { EmployeePunchBody } from "./time.dto"

export type ClockPunchAction = "clock-in" | "clock-out" | "break-start" | "break-end"

export interface QueuedPunch {
  action: ClockPunchAction
  body: EmployeePunchBody
}

const QUEUE_KEY = "vesta.clock-queue"

export const ENDPOINT: Record<ClockPunchAction, string> = {
  "clock-in": "/employee/timer/clock-in",
  "clock-out": "/employee/timer/clock-out",
  "break-start": "/employee/timer/break/start",
  "break-end": "/employee/timer/break/end",
}

export function loadClockQueue(): QueuedPunch[] {
  return load<QueuedPunch[]>(QUEUE_KEY) ?? []
}

function setClockQueue(queue: QueuedPunch[]) {
  if (queue.length === 0) remove(QUEUE_KEY)
  else save(QUEUE_KEY, queue)
}

export function enqueuePunch(punch: QueuedPunch) {
  setClockQueue([...loadClockQueue(), punch])
}

export function hasQueuedPunches(): boolean {
  return loadClockQueue().length > 0
}

/** A failed response with no HTTP status is a network/offline failure (retryable). */
export function isOfflineFailure(res: { ok: boolean; status?: number | null }): boolean {
  return !res.ok && res.status == null
}

// Serialises concurrent flushes. getClockSession and sendPunch can both trigger
// a flush at the same time; without this lock they'd each read the queue and
// replay the same punches, double-posting them on reconnect.
let inFlightFlush: Promise<boolean> | null = null

/**
 * Replays queued punches in order. Stops at the first offline failure (keeping
 * the tail for later); drops a punch the server rejects (4xx/5xx) since retrying
 * it can never succeed. Returns true when the queue is fully drained.
 *
 * Concurrent calls share a single in-flight replay (no double-posting).
 */
export async function flushClockQueue(http: HttpClient): Promise<boolean> {
  if (inFlightFlush) return inFlightFlush
  inFlightFlush = (async () => {
    let queue = loadClockQueue()
    while (queue.length > 0) {
      const next = queue[0]
      const res = await http.post(ENDPOINT[next.action], next.body)
      if (isOfflineFailure(res)) return false
      // ok → synced; server reject → unrecoverable, drop it. Either way, advance.
      queue = queue.slice(1)
      setClockQueue(queue)
    }
    return true
  })()
  try {
    return await inFlightFlush
  } finally {
    inFlightFlush = null
  }
}
