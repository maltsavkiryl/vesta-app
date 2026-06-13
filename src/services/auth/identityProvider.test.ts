jest.mock("@/config", () => ({
  __esModule: true,
  default: {
    AUTH: {
      devTokenEnabled: true,
      devObjectId: "dev-employee-oid",
      devEmail: "demo.employee@vesta.local",
      devName: "Demo Employee",
      entra: { authority: "", clientId: "", scopes: [] },
    },
  },
}))

import { acquireIdToken, refreshIdToken } from "./identityProvider"

function decode(token: string) {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/")
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"))
}

describe("identityProvider (dev)", () => {
  it("returns a base64url dev token encoding the configured identity", async () => {
    const payload = decode(await acquireIdToken())
    expect(payload.objectId).toBe("dev-employee-oid")
    expect(payload.email).toBe("demo.employee@vesta.local")
    expect(payload.name).toBe("Demo Employee")
  })
  it("refreshIdToken returns the same dev token in dev mode", async () => {
    expect(decode(await refreshIdToken()).objectId).toBe("dev-employee-oid")
  })
})
