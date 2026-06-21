import { useState } from "react"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { fireHaptic } from "@/utils/haptics"

type SocialProvider = "google"

/**
 * Drives the landing-screen social sign-in buttons. Google is federated through
 * the same Entra flow as email, so it reuses the id-token exchange and the
 * multi-employer picker — only the IdP hint differs.
 */
export function useSocialSignIn() {
  const router = useRouter()
  const { signInWithGoogle } = useAuthActions()
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
  const [error, setError] = useState<string>()

  const handleGoogle = async () => {
    if (pendingProvider) return
    setPendingProvider("google")
    setError(undefined)
    try {
      const result = await signInWithGoogle()
      if (!result.ok) {
        fireHaptic("error")
        setError(result.error.message)
        return
      }
      fireHaptic("success")
      // Multi-employer identities still go through the employer picker.
      if (result.data.kind === "select-employer") {
        router.push("/(auth)/select-employer")
        return
      }
      router.replace("/")
    } catch {
      // The Entra flow was dismissed or failed before returning a token.
      fireHaptic("error")
      setError("Couldn't continue with Google. Please try again.")
    } finally {
      setPendingProvider(null)
    }
  }

  return { error, handleGoogle, pendingProvider }
}

export type SocialSignInState = ReturnType<typeof useSocialSignIn>
