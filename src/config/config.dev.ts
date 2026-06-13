/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "http://localhost:3000/api/v1",
  DEMO_AUTH_ENABLED: true,
  SUPPORT_EMAIL: "support@vesta.services",

  AUTH: {
    apiKey: "",
    devTokenEnabled: true,
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
