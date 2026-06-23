import type { HttpClient } from "@/services/api/httpClient"

import { createOfflineMutationQueue, isOfflineFailure } from "./offlineMutationQueue"

function httpWith(post: jest.Mock): HttpClient {
  return { get: jest.fn(), post, put: jest.fn(), delete: jest.fn() } as unknown as HttpClient
}

type Action = "a" | "b"
const endpointFor = (action: Action) => `/x/${action}`

function makeQueue(key: string) {
  return createOfflineMutationQueue<Action, { v: number }>({ storageKey: key, endpointFor })
}

describe("isOfflineFailure", () => {
  it("flags only status-less failures as offline", () => {
    expect(isOfflineFailure({ ok: false })).toBe(true)
    expect(isOfflineFailure({ ok: false, status: 500 })).toBe(false)
    expect(isOfflineFailure({ ok: true, status: 200 })).toBe(false)
  })
})

describe("createOfflineMutationQueue", () => {
  beforeEach(async () => {
    // Drain any leftovers from the shared mock storage under this key.
    await makeQueue("vesta.test-queue").flush(
      httpWith(jest.fn().mockResolvedValue({ ok: true, status: 204 })),
    )
  })

  it("enqueues, reports pending, and replays in order then drains", async () => {
    const queue = makeQueue("vesta.test-queue")
    queue.enqueue({ action: "a", body: { v: 1 } })
    queue.enqueue({ action: "b", body: { v: 2 } })
    expect(queue.hasQueued()).toBe(true)
    const post = jest.fn().mockResolvedValue({ ok: true, status: 204 })

    const drained = await queue.flush(httpWith(post))

    expect(drained).toBe(true)
    expect(queue.hasQueued()).toBe(false)
    expect(post).toHaveBeenNthCalledWith(1, "/x/a", { v: 1 })
    expect(post).toHaveBeenNthCalledWith(2, "/x/b", { v: 2 })
  })

  it("stops and keeps the tail on an offline failure", async () => {
    const queue = makeQueue("vesta.test-queue")
    queue.enqueue({ action: "a", body: { v: 1 } })
    queue.enqueue({ action: "b", body: { v: 2 } })
    const post = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: false })

    const drained = await queue.flush(httpWith(post))

    expect(drained).toBe(false)
    expect(queue.load()).toHaveLength(1)
    expect(queue.load()[0].action).toBe("b")
  })

  it("drops a server-rejected mutation and keeps draining", async () => {
    const queue = makeQueue("vesta.test-queue")
    queue.enqueue({ action: "a", body: { v: 1 } })
    const post = jest.fn().mockResolvedValue({ ok: false, status: 422 })

    const drained = await queue.flush(httpWith(post))

    expect(drained).toBe(true)
    expect(queue.hasQueued()).toBe(false)
  })

  it("isolates queues by storage key", async () => {
    const queueA = makeQueue("vesta.test-queue")
    const queueOther = makeQueue("vesta.test-queue-other")
    queueA.enqueue({ action: "a", body: { v: 1 } })

    expect(queueA.hasQueued()).toBe(true)
    expect(queueOther.hasQueued()).toBe(false)

    // cleanup
    await queueA.flush(httpWith(jest.fn().mockResolvedValue({ ok: true, status: 204 })))
  })
})
