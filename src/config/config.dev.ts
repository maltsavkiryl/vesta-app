/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "http://localhost:5162/api/v1",
  DEMO_AUTH_ENABLED: true,
  SUPPORT_EMAIL: "support@vesta.services",

  AUTH: {
    // Public client API key for the rate-limited login endpoints. Kept out of
    // committed JS (see README) — supplied via the gitignored EXPO_PUBLIC_VESTA_API_KEY.
    apiKey: process.env.EXPO_PUBLIC_VESTA_API_KEY ?? "",
    devTokenEnabled: true,
    devObjectId: "dev-employee-oid",
    devEmail: "demo.employee@vesta.local",
    devName: "Demo Employee",
    entra: {
      // Dev bypasses Entra via devTokenEnabled, but allow pointing at a real
      // tenant when testing the OIDC path locally (supplied via env, uncommitted).
      authority: process.env.EXPO_PUBLIC_ENTRA_AUTHORITY ?? "",
      clientId: process.env.EXPO_PUBLIC_ENTRA_CLIENT_ID ?? "",
      scopes: ["openid", "profile", "email", "offline_access"],
    },
  },
}
