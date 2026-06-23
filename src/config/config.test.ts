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

describe("production auth config", () => {
  const original = { ...process.env }
  afterEach(() => {
    process.env = { ...original }
  })

  function loadProdConfig() {
    let prodConfig: typeof import("./config.prod").default
    jest.isolateModules(() => {
      prodConfig = require("./config.prod").default
    })
    return prodConfig!
  }

  it("injects Entra credentials and the api key from EXPO_PUBLIC_* env at build time", () => {
    process.env.EXPO_PUBLIC_ENTRA_AUTHORITY = "https://login.example.com/tenant-id"
    process.env.EXPO_PUBLIC_ENTRA_CLIENT_ID = "client-123"
    process.env.EXPO_PUBLIC_VESTA_API_KEY = "key-abc"

    const prodConfig = loadProdConfig()

    expect(prodConfig.AUTH.entra.authority).toBe("https://login.example.com/tenant-id")
    expect(prodConfig.AUTH.entra.clientId).toBe("client-123")
    expect(prodConfig.AUTH.apiKey).toBe("key-abc")
  })

  it("falls back to empty strings when the env is not provided", () => {
    delete process.env.EXPO_PUBLIC_ENTRA_AUTHORITY
    delete process.env.EXPO_PUBLIC_ENTRA_CLIENT_ID
    delete process.env.EXPO_PUBLIC_VESTA_API_KEY

    const prodConfig = loadProdConfig()

    expect(prodConfig.AUTH.entra.authority).toBe("")
    expect(prodConfig.AUTH.entra.clientId).toBe("")
  })
})
