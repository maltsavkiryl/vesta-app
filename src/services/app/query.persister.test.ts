import { createMmkvPersister, queryPersister } from "./query.persister"

jest.mock("@/utils/storage")

import * as storage from "@/utils/storage"

describe("createMmkvPersister", () => {
  const persister = createMmkvPersister()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(storage.loadString as jest.Mock).mockReturnValue(null)
  })

  it("persistClient stores serialized client", async () => {
    const client = { timestamp: 1, buster: "v1", clientState: { queries: [], mutations: [] } } as any
    await persister.persistClient(client)
    expect(storage.saveString).toHaveBeenCalledWith("rq-cache-v1", JSON.stringify(client))
  })

  it("restoreClient returns parsed client", async () => {
    const client = { timestamp: 1, buster: "v1", clientState: { queries: [], mutations: [] } }
    ;(storage.loadString as jest.Mock).mockReturnValue(JSON.stringify(client))
    const result = await persister.restoreClient()
    expect(result).toEqual(client)
  })

  it("restoreClient returns undefined when nothing stored", async () => {
    ;(storage.loadString as jest.Mock).mockReturnValue(null)
    const result = await persister.restoreClient()
    expect(result).toBeUndefined()
  })

  it("restoreClient returns undefined on malformed JSON", async () => {
    ;(storage.loadString as jest.Mock).mockReturnValue("{bad json")
    const result = await persister.restoreClient()
    expect(result).toBeUndefined()
  })

  it("removeClient calls remove", async () => {
    await persister.removeClient()
    expect(storage.remove).toHaveBeenCalledWith("rq-cache-v1")
  })
})

describe("queryPersister singleton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("is a valid Persister with removeClient", () => {
    expect(typeof queryPersister.persistClient).toBe("function")
    expect(typeof queryPersister.restoreClient).toBe("function")
    expect(typeof queryPersister.removeClient).toBe("function")
  })

  it("removeClient wipes the on-disk cache key (used on sign-out)", async () => {
    await queryPersister.removeClient()
    expect(storage.remove).toHaveBeenCalledWith("rq-cache-v1")
  })
})
