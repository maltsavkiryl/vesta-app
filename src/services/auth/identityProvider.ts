import * as AuthSession from "expo-auth-session"

import Config from "@/config"

function base64url(input: string): string {
  const b64 =
    typeof btoa === "function" ? btoa(input) : Buffer.from(input, "utf8").toString("base64")
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function devToken(): string {
  return base64url(
    JSON.stringify({
      objectId: Config.AUTH.devObjectId,
      email: Config.AUTH.devEmail,
      name: Config.AUTH.devName,
    }),
  )
}

let cachedTokens: AuthSession.TokenResponse | null = null

async function discovery() {
  return AuthSession.fetchDiscoveryAsync(Config.AUTH.entra.authority)
}

function redirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: "vesta" })
}

export interface AcquireIdTokenOptions {
  /**
   * Pre-selects a federated identity provider in the Entra (CIAM) sign-in flow,
   * e.g. "google.com". Requires that provider to be configured as a social
   * identity provider on the tenant; without it Entra shows its normal chooser.
   */
  domainHint?: string
}

export async function acquireIdToken(options?: AcquireIdTokenOptions): Promise<string> {
  if (Config.AUTH.devTokenEnabled) return devToken()
  const d = await discovery()
  const request = new AuthSession.AuthRequest({
    clientId: Config.AUTH.entra.clientId,
    scopes: Config.AUTH.entra.scopes,
    redirectUri: redirectUri(),
    usePKCE: true,
    ...(options?.domainHint ? { extraParams: { domain_hint: options.domainHint } } : {}),
  })
  const result = await request.promptAsync(d)
  if (result.type !== "success" || !result.params.code) throw new Error("entra-auth-cancelled")
  cachedTokens = await AuthSession.exchangeCodeAsync(
    {
      clientId: Config.AUTH.entra.clientId,
      code: result.params.code,
      redirectUri: redirectUri(),
      extraParams: { code_verifier: request.codeVerifier ?? "" },
    },
    d,
  )
  if (!cachedTokens.idToken) throw new Error("entra-no-id-token")
  return cachedTokens.idToken
}

export async function refreshIdToken(): Promise<string> {
  if (Config.AUTH.devTokenEnabled) return devToken()
  if (!cachedTokens?.refreshToken) return acquireIdToken()
  const d = await discovery()
  cachedTokens = await AuthSession.refreshAsync(
    { clientId: Config.AUTH.entra.clientId, refreshToken: cachedTokens.refreshToken },
    d,
  )
  if (!cachedTokens.idToken) throw new Error("entra-no-id-token")
  return cachedTokens.idToken
}

export async function signOutIdentity(): Promise<void> {
  cachedTokens = null
}
