import { createAuthService } from "./authService"
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
jest.mock("./identityProvider", () => ({
  acquireIdToken: jest.fn(async () => "id-token"),
  refreshIdToken: jest.fn(async () => "id-token"),
  signOutIdentity: jest.fn(async () => {}),
}))

function jwtWithExp(expSec: number) {
  return "h." + Buffer.from(JSON.stringify({ exp: expSec })).toString("base64") + ".s"
}

describe("authService", () => {
  beforeEach(async () => {
    await tokenStore.clear()
  })

  it("logs in, selects employer, stores the backend jwt", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employees/login"))
          return {
            ok: true,
            status: 200,
            data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] },
          }
        if (url.endsWith("/auth/employees/select-employer"))
          return {
            ok: true,
            status: 200,
            data: {
              access_token: jwt,
              token_type: "Bearer",
              expires_in: 300,
              profile_complete: true,
            },
          }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ kind: "signed-in", accountId: "emp-1", profileComplete: true })
    }
    expect(service.getCurrentAccountId()).toBe("emp-1")
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("returns a select-employer outcome and completes only once an employer is chosen", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employees/login"))
          return {
            ok: true,
            status: 200,
            data: {
              memberships: [
                { employerUniqueCode: "emp-1", employerName: "Bistro" },
                { employerUniqueCode: "emp-2", employerName: "Cafe" },
              ],
            },
          }
        if (url.endsWith("/auth/employees/select-employer"))
          return {
            ok: true,
            status: 200,
            data: {
              access_token: jwt,
              token_type: "Bearer",
              expires_in: 300,
              profile_complete: true,
            },
          }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(true)
    if (result.ok && result.data.kind === "select-employer") {
      expect(result.data.employers).toEqual([
        { uniqueCode: "emp-1", name: "Bistro" },
        { uniqueCode: "emp-2", name: "Cafe" },
      ])
    } else {
      throw new Error("expected select-employer outcome")
    }
    // No session token is stored until an employer is chosen.
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(service.getPendingEmployers()).toHaveLength(2)

    const selected = await service.selectEmployer("emp-2")
    expect(selected.ok).toBe(true)
    expect(service.getCurrentAccountId()).toBe("emp-2")
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("signIn accepts a federated provider hint (Google) and signs in", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? {
              ok: true,
              status: 200,
              data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] },
            }
          : {
              ok: true,
              status: 200,
              data: {
                access_token: jwt,
                token_type: "Bearer",
                expires_in: 300,
                profile_complete: true,
              },
            },
      ),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn({ domainHint: "google.com" })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ kind: "signed-in", accountId: "emp-1", profileComplete: true })
    }
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("loadSession rehydrates account state from storage after sign-in", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? {
              ok: true,
              status: 200,
              data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] },
            }
          : {
              ok: true,
              status: 200,
              data: {
                access_token: jwt,
                token_type: "Bearer",
                expires_in: 300,
                profile_complete: false,
              },
            },
      ),
    }
    const service = createAuthService(authApi)
    await service.signIn()
    const restored = await service.loadSession()
    expect(restored).toEqual({ accountId: "emp-1", profileComplete: false })
    expect(service.getCurrentAccountId()).toBe("emp-1")
  })

  it("loadSession returns null and clears identity when storage is empty", async () => {
    await tokenStore.clear()
    const authApi: any = { post: jest.fn() }
    const service = createAuthService(authApi)
    expect(await service.loadSession()).toBeNull()
    expect(service.getCurrentAccountId()).toBeNull()
  })

  it("returns failure when there are no memberships", async () => {
    const authApi: any = {
      post: jest.fn(async () => ({ ok: true, status: 200, data: { memberships: [] } })),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(false)
  })

  it("returns failure when login call fails", async () => {
    const authApi: any = {
      post: jest.fn(async () => ({ ok: false, status: 401, data: undefined })),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(false)
  })

  it("reauthenticate refreshes and returns true on success", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? {
              ok: true,
              status: 200,
              data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] },
            }
          : {
              ok: true,
              status: 200,
              data: {
                access_token: jwt,
                token_type: "Bearer",
                expires_in: 300,
                profile_complete: true,
              },
            },
      ),
    }
    const service = createAuthService(authApi)
    expect(await service.reauthenticate()).toBe(true)
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("accepts an invitation, then establishes the session from refreshed memberships", async () => {
    const jwt = jwtWithExp(1893456000)
    const tokenPayload = {
      access_token: jwt,
      token_type: "Bearer",
      expires_in: 300,
      profile_complete: true,
    }
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employee-invitations/accept"))
          return { ok: true, status: 200, data: tokenPayload }
        if (url.endsWith("/auth/employees/login"))
          return {
            ok: true,
            status: 200,
            data: { memberships: [{ employerUniqueCode: "emp-9", employerName: "New Bistro" }] },
          }
        if (url.endsWith("/auth/employees/select-employer"))
          return { ok: true, status: 200, data: tokenPayload }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)

    const result = await service.acceptInvitation("11111111-1111-1111-1111-111111111111")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ kind: "signed-in", accountId: "emp-9", profileComplete: true })
    }
    expect(service.getCurrentAccountId()).toBe("emp-9")
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("fails and stores no token when the invitation is invalid or expired", async () => {
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employee-invitations/accept"))
          return { ok: false, status: 404, data: undefined }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)

    const result = await service.acceptInvitation("bad-token")

    expect(result.ok).toBe(false)
    expect(tokenStore.getAccessToken()).toBeNull()
  })

  it("signOut clears token and identity", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) =>
        url.endsWith("/auth/employees/login")
          ? {
              ok: true,
              status: 200,
              data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] },
            }
          : {
              ok: true,
              status: 200,
              data: {
                access_token: jwt,
                token_type: "Bearer",
                expires_in: 300,
                profile_complete: true,
              },
            },
      ),
    }
    const service = createAuthService(authApi)
    await service.signIn()
    await service.signOut()
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(service.getCurrentAccountId()).toBeNull()
  })
})
