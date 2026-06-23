import { tokenStore } from "@/services/auth/tokenStore"

import { createHttpClient } from "./httpClient"

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))

describe("httpClient", () => {
  it("retries once after re-auth on 401", async () => {
    await tokenStore.set({
      accessToken: "stale",
      expiresAt: Date.now() + 600000,
      accountId: "emp-1",
      profileComplete: true,
    })
    let calls = 0
    const apisauce: any = {
      get: jest.fn(async () => {
        calls += 1
        return calls === 1
          ? { ok: false, status: 401, problem: "CLIENT_ERROR" }
          : { ok: true, status: 200, data: { hi: true } }
      }),
    }
    const reauthenticate = jest.fn(async () => {
      await tokenStore.set({
        accessToken: "fresh",
        expiresAt: Date.now() + 600000,
        accountId: "emp-1",
        profileComplete: true,
      })
      return true
    })
    const client = createHttpClient(apisauce, reauthenticate)
    const res = await client.get("/employee")
    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(calls).toBe(2)
    expect(res.ok).toBe(true)
  })

  it("does not loop when re-auth fails", async () => {
    await tokenStore.set({
      accessToken: "stale",
      expiresAt: Date.now() + 600000,
      accountId: "emp-1",
      profileComplete: true,
    })
    const apisauce: any = {
      get: jest.fn(async () => ({ ok: false, status: 401, problem: "CLIENT_ERROR" })),
    }
    const reauthenticate = jest.fn(async () => false)
    const client = createHttpClient(apisauce, reauthenticate)
    const res = await client.get("/employee")
    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(401)
  })

  it("retries once but returns 401 if retry still unauthorized", async () => {
    await tokenStore.set({
      accessToken: "stale",
      expiresAt: Date.now() + 600000,
      accountId: "emp-1",
      profileComplete: true,
    })
    let calls = 0
    const apisauce: any = {
      get: jest.fn(async () => {
        calls += 1
        return { ok: false, status: 401, problem: "CLIENT_ERROR" }
      }),
    }
    const reauthenticate = jest.fn(async () => true)
    const client = createHttpClient(apisauce, reauthenticate)
    const res = await client.get("/employee")
    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(calls).toBe(2)
    expect(res.status).toBe(401)
  })

  it("proactively refreshes a token about to expire before sending (no 401 needed)", async () => {
    await tokenStore.set({
      accessToken: "expiring",
      expiresAt: Date.now() + 5000, // within the 60s refresh lead
      accountId: "emp-1",
      profileComplete: true,
    })
    const apisauce: any = {
      get: jest.fn(async () => ({ ok: true, status: 200, data: { hi: true } })),
    }
    const reauthenticate = jest.fn(async () => {
      await tokenStore.set({
        accessToken: "fresh",
        expiresAt: Date.now() + 600000,
        accountId: "emp-1",
        profileComplete: true,
      })
      return true
    })
    const client = createHttpClient(apisauce, reauthenticate)

    const res = await client.get("/employee")

    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(apisauce.get).toHaveBeenCalledTimes(1) // refreshed first, no 401 round-trip
    expect(res.ok).toBe(true)
  })

  it("coalesces concurrent refreshes into a single reauthenticate", async () => {
    await tokenStore.set({
      accessToken: "expiring",
      expiresAt: Date.now() + 5000,
      accountId: "emp-1",
      profileComplete: true,
    })
    const apisauce: any = {
      get: jest.fn(async () => ({ ok: true, status: 200, data: { hi: true } })),
    }
    let resolveRefresh: (() => void) | undefined
    const reauthenticate = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveRefresh = () => resolve(true)
        }),
    )
    const client = createHttpClient(apisauce, reauthenticate)

    const inFlight = Promise.all([client.get("/a"), client.get("/b"), client.get("/c")])
    await Promise.resolve()
    resolveRefresh?.()
    await inFlight

    expect(reauthenticate).toHaveBeenCalledTimes(1)
  })

  it("does not refresh proactively when no token is held (unauthenticated calls)", async () => {
    await tokenStore.clear()
    const apisauce: any = {
      post: jest.fn(async () => ({ ok: true, status: 200, data: {} })),
    }
    const reauthenticate = jest.fn(async () => true)
    const client = createHttpClient(apisauce, reauthenticate)

    await client.post("/auth/employees/login")

    expect(reauthenticate).not.toHaveBeenCalled()
  })
})
