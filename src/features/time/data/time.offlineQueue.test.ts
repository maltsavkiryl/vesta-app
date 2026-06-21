import type { HttpClient } from "@/services/api/httpClient"

import {
  enqueuePunch,
  flushClockQueue,
  hasQueuedPunches,
  isOfflineFailure,
  loadClockQueue,
} from "./time.offlineQueue"

function httpWith(post: jest.Mock): HttpClient {
  return { get: jest.fn(), post, put: jest.fn(), delete: jest.fn() } as unknown as HttpClient
}

const body = { establishmentUniqueCode: "est-1", occurredAtUtc: "2026-06-20T08:00:00Z" }

describe("time.offlineQueue", () => {
  beforeEach(async () => {
    // Drain anything a previous test left in the shared mock storage.
    await flushClockQueue(httpWith(jest.fn().mockResolvedValue({ ok: true, status: 204 })))
  })

  it("flags only status-less failures as offline", () => {
    expect(isOfflineFailure({ ok: false })).toBe(true)
    expect(isOfflineFailure({ ok: false, status: 422 })).toBe(false)
    expect(isOfflineFailure({ ok: true, status: 204 })).toBe(false)
  })

  it("replays queued punches in order, then drains", async () => {
    enqueuePunch({ action: "clock-in", body })
    enqueuePunch({ action: "break-start", body })
    const post = jest.fn().mockResolvedValue({ ok: true, status: 204 })

    const drained = await flushClockQueue(httpWith(post))

    expect(drained).toBe(true)
    expect(hasQueuedPunches()).toBe(false)
    expect(post).toHaveBeenNthCalledWith(1, "/employee/timer/clock-in", body)
    expect(post).toHaveBeenNthCalledWith(2, "/employee/timer/break/start", body)
  })

  it("stops and keeps the tail on an offline failure", async () => {
    enqueuePunch({ action: "clock-in", body })
    enqueuePunch({ action: "clock-out", body })
    const post = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: false })

    const drained = await flushClockQueue(httpWith(post))

    expect(drained).toBe(false)
    expect(loadClockQueue()).toHaveLength(1)
    expect(loadClockQueue()[0].action).toBe("clock-out")
  })

  it("drops a server-rejected punch and keeps draining", async () => {
    enqueuePunch({ action: "clock-in", body })
    const post = jest.fn().mockResolvedValue({ ok: false, status: 422 })

    const drained = await flushClockQueue(httpWith(post))

    expect(drained).toBe(true)
    expect(hasQueuedPunches()).toBe(false)
  })
})
