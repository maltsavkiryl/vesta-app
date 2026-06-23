/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "https://api.vesta.services/api/v1",
  // Production authenticates through the identity provider (Entra) over HTTP.
  // The demo/mock sign-in path must never be reachable in production builds.
  DEMO_AUTH_ENABLED: false,
  SUPPORT_EMAIL: "support@vesta.services",

  AUTH: {
    // Non-secret public client values, injected at build time via EAS
    // environment variables (EXPO_PUBLIC_* are inlined into the bundle). The
    // production build fails closed — login won't work — until these are set.
    // See README "Production environment variables".
    apiKey: process.env.EXPO_PUBLIC_VESTA_API_KEY ?? "",
    devTokenEnabled: false,
    devObjectId: "dev-employee-oid",
    devEmail: "demo.employee@vesta.local",
    devName: "Demo Employee",
    entra: {
      authority: process.env.EXPO_PUBLIC_ENTRA_AUTHORITY ?? "",
      clientId: process.env.EXPO_PUBLIC_ENTRA_CLIENT_ID ?? "",
      scopes: ["openid", "profile", "email", "offline_access"],
    },
  },
}
