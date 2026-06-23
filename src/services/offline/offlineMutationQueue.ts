/**
 * Generic offline mutation outbox.
 *
 * Persists mutations that couldn't reach the server (no signal) and replays them
 * in order once connectivity returns — the reusable generalization of the Time
 * clock-punch queue. Any feature with replayable, order-sensitive writes can
 * create its own queue:
 *
 *   const queue = createOfflineMutationQueue<MyAction, MyBody>({
 *     storageKey: "vesta.my-feature-queue",
 *     endpointFor: (action) => ENDPOINTS[action],
 *   })
 *
 * Caveat for adopters: only enqueue mutations that are safe to replay after a
 * delay (carry the real occurredAt where the server needs it) and where the UI
 * can present an optimistic result while queued. Mutations needing a fresh
 * server response, conflict resolution, or strict idempotency keys need extra
 * handling before adoption.
 */
import type { HttpClient } from "@/services/api/httpClient"
import { load, remove, save } from "@/utils/storage"

export interface QueuedMutation<TAction extends string, TBody> {
  action: TAction
  body: TBody
}

/** A failed response with no HTTP status is a network/offline failure (retryable). */
export function isOfflineFailure(res: { ok: boolean; status?: number | null }): boolean {
  return !res.ok && res.status == null
}

export interface OfflineMutationQueue<TAction extends string, TBody> {
  load(): QueuedMutation<TAction, TBody>[]
  enqueue(mutation: QueuedMutation<TAction, TBody>): void
  hasQueued(): boolean
  /**
   * Replays queued mutations in order. Stops at the first offline failure
   * (keeping the tail); drops a mutation the server rejects (any HTTP status)
   * since retrying it can never succeed. Returns true when fully drained.
   * Concurrent calls share a single in-flight replay (no double-posting).
   */
  flush(http: HttpClient): Promise<boolean>
}

export function createOfflineMutationQueue<TAction extends string, TBody>(config: {
  storageKey: string
  endpointFor: (action: TAction) => string
}): OfflineMutationQueue<TAction, TBody> {
  const { storageKey, endpointFor } = config
  type Item = QueuedMutation<TAction, TBody>

  function loadQueue(): Item[] {
    return load<Item[]>(storageKey) ?? []
  }
  function setQueue(queue: Item[]): void {
    if (queue.length === 0) remove(storageKey)
    else save(storageKey, queue)
  }

  // Serialises concurrent flushes so two callers can't read the queue and replay
  // the same items, double-posting on reconnect.
  let inFlightFlush: Promise<boolean> | null = null

  return {
    load: loadQueue,
    enqueue(mutation) {
      setQueue([...loadQueue(), mutation])
    },
    hasQueued() {
      return loadQueue().length > 0
    },
    async flush(http) {
      if (inFlightFlush) return inFlightFlush
      inFlightFlush = (async () => {
        let queue = loadQueue()
        while (queue.length > 0) {
          const next = queue[0]
          const res = await http.post(endpointFor(next.action), next.body as object)
          if (isOfflineFailure(res)) return false
          // ok → synced; server reject → unrecoverable, drop it. Either way, advance.
          queue = queue.slice(1)
          setQueue(queue)
        }
        return true
      })()
      try {
        return await inFlightFlush
      } finally {
        inFlightFlush = null
      }
    },
  }
}
