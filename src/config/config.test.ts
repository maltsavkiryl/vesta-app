import Config from "@/config"

describe("auth config", () => {
  it("exposes an AUTH block with the dev-token flag and entra fields", () => {
    expect(typeof Config.AUTH.apiKey).toBe("string")
    expect(typeof Config.AUTH.devTokenEnabled).toBe("boolean")
    expect(typeof Config.AUTH.entra.authority).toBe("string")
    expect(typeof Config.AUTH.entra.clientId).toBe("string")
    expect(Array.isArray(Config.AUTH.entra.scopes)).toBe(true)
  })
  it("has dev identity matching the backend seed", () => {
    expect(Config.AUTH.devObjectId).toBe("dev-employee-oid")
    expect(Config.AUTH.devEmail).toBe("demo.employee@vesta.local")
  })
})
