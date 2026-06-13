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
      expiresAt: Date.now() + 60000,
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
        expiresAt: Date.now() + 60000,
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
      expiresAt: Date.now() + 60000,
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
      expiresAt: Date.now() + 60000,
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
})
