/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "https://api.vesta.services/api/v1",
  DEMO_AUTH_ENABLED: true,
  SUPPORT_EMAIL: "support@vesta.services",

  AUTH: {
    apiKey: "",
    devTokenEnabled: false,
    devObjectId: "dev-employee-oid",
    devEmail: "demo.employee@vesta.local",
    devName: "Demo Employee",
    entra: {
      authority: "",
      clientId: "",
      scopes: ["openid", "profile", "email", "offline_access"],
    },
  },
}
