import { toAppSessionFromToken, decodeJwtExp } from "./auth.api"

describe("auth.api transformers", () => {
  it("maps an access-token response + accountId to an AppSession", () => {
    const session = toAppSessionFromToken(
      { access_token: "x", token_type: "Bearer", expires_in: 300, profile_complete: true },
      "emp-uuid",
      "2026-06-12T10:00:00.000Z",
    )
    expect(session).toEqual({
      accountId: "emp-uuid",
      isSignedIn: true,
      needsOnboarding: false,
      signedInAt: "2026-06-12T10:00:00.000Z",
    })
  })
  it("flags onboarding when profile is incomplete", () => {
    const session = toAppSessionFromToken(
      { access_token: "x", token_type: "Bearer", expires_in: 300, profile_complete: false },
      "emp-uuid",
      "2026-06-12T10:00:00.000Z",
    )
    expect(session.needsOnboarding).toBe(true)
  })
  it("reads exp from a JWT payload", () => {
    const jwt = "h." + Buffer.from(JSON.stringify({ exp: 1893456000 })).toString("base64") + ".s"
    expect(decodeJwtExp(jwt)).toBe(1893456000)
  })
  it("returns null exp for malformed jwt", () => {
    expect(decodeJwtExp("nope")).toBeNull()
  })
})
