export interface AppSession {
  accountId: string | null
  isSignedIn: boolean
  needsOnboarding: boolean
  signedInAt?: string
}
