export type AuthError =
  | { type: "demo-disabled"; message: string }
  | { type: "account-not-found"; message: string }
  | { type: "invalid-credentials"; message: string }
  | { type: "account-exists"; message: string }
  | { type: "reset-unavailable"; message: string }
  | { type: "validation"; message: string }
  | { type: "onboarding-invalid"; message: string }
