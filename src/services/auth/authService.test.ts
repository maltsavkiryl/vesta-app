jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))
jest.mock("./identityProvider", () => ({
  acquireIdToken: jest.fn(async () => "id-token"),
  refreshIdToken: jest.fn(async () => "id-token"),
  signOutIdentity: jest.fn(async () => {}),
}))

import { tokenStore } from "./tokenStore"
import { createAuthService } from "./authService"

function jwtWithExp(expSec: number) {
  return "h." + Buffer.from(JSON.stringify({ exp: expSec })).toString("base64") + ".s"
}

describe("authService", () => {
  beforeEach(async () => { await tokenStore.clear() })

  it("logs in, selects employer, stores the backend jwt", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employees/login"))
          return { ok: true, status: 200, data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] } }
        if (url.endsWith("/auth/employees/select-employer"))
          return { ok: true, status: 200, data: { access_token: jwt, token_type: "Bearer", expires_in: 300, profile_complete: true } }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(true)
    expect(service.getCurrentAccountId()).toBe("emp-1")
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("returns failure when there are no memberships", async () => {
    const authApi: any = { post: jest.fn(async () => ({ ok: true, status: 200, data: { memberships: [] } })) }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(false)
  })

  it("returns failure when login call fails", async () => {
    const authApi: any = { post: jest.fn(async () => ({ ok: false, status: 401, data: undefined })) }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(false)
  })

  it("reauthenticate refreshes and returns true on success", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? { ok: true, status: 200, data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] } }
          : { ok: true, status: 200, data: { access_token: jwt, token_type: "Bearer", expires_in: 300, profile_complete: true } }),
    }
    const service = createAuthService(authApi)
    expect(await service.reauthenticate()).toBe(true)
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("signOut clears token and identity", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? { ok: true, status: 200, data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] } }
          : { ok: true, status: 200, data: { access_token: jwt, token_type: "Bearer", expires_in: 300, profile_complete: true } }),
    }
    const service = createAuthService(authApi)
    await service.signIn()
    await service.signOut()
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(service.getCurrentAccountId()).toBeNull()
  })
})
