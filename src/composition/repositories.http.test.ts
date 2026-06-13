jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))

import { ensureSeededAccount, getAccountState } from "@/services/app/app.store"

describe("ensureSeededAccount", () => {
  it("creates a usable mock account for an unknown real accountId", () => {
    const accountId = "real-emp-uuid-" + Math.floor(Math.random() * 1e6)
    ensureSeededAccount(accountId)
    const state = getAccountState(accountId)
    expect(state).toBeTruthy()
    expect(Array.isArray(state.notifications)).toBe(true)
  })
  it("is idempotent", () => {
    const accountId = "real-emp-idem-" + Math.floor(Math.random() * 1e6)
    ensureSeededAccount(accountId)
    ensureSeededAccount(accountId)
    expect(getAccountState(accountId)).toBeTruthy()
  })
})
