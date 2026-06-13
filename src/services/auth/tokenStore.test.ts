import { tokenStore } from "./tokenStore"

const store: Record<string, string> = {}
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    store[k] = v
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    delete store[k]
  }),
}))

describe("tokenStore", () => {
  beforeEach(async () => {
    await tokenStore.clear()
  })

  it("persists and returns the access token", async () => {
    await tokenStore.set({
      accessToken: "jwt-abc",
      expiresAt: 9999999999000,
      accountId: "emp-1",
      profileComplete: true,
    })
    expect(tokenStore.getAccessToken()).toBe("jwt-abc")
    const reloaded = await tokenStore.load()
    expect(reloaded?.accessToken).toBe("jwt-abc")
  })

  it("persists and returns the account id and profile-complete flag", async () => {
    await tokenStore.set({
      accessToken: "jwt-abc",
      expiresAt: 9999999999000,
      accountId: "emp-1",
      profileComplete: true,
    })
    expect(tokenStore.getAccountId()).toBe("emp-1")
    expect(tokenStore.getProfileComplete()).toBe(true)
    await tokenStore.clear()
    expect(tokenStore.getAccountId()).toBeNull()
    expect(tokenStore.getProfileComplete()).toBe(false)
  })

  it("reports expiry", async () => {
    await tokenStore.set({
      accessToken: "x",
      expiresAt: 1000,
      accountId: "emp-1",
      profileComplete: false,
    })
    expect(tokenStore.isExpired(2000)).toBe(true)
    expect(tokenStore.isExpired(500)).toBe(false)
  })

  it("clears", async () => {
    await tokenStore.set({
      accessToken: "x",
      expiresAt: 9999999999000,
      accountId: "emp-1",
      profileComplete: true,
    })
    await tokenStore.clear()
    expect(tokenStore.getAccessToken()).toBeNull()
  })
})
