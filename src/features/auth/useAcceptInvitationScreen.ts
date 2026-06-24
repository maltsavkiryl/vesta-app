import { useEffect, useRef, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

export type AcceptInvitationStatus = "working" | "error"

/**
 * Drives the invitation deep-link screen (`vesta://invite?token=<guid>`). On
 * mount it accepts the invitation exactly once, then lets the session route the
 * user: a single membership signs straight in (route guards take over), while a
 * multi-employer identity is sent to the picker. Failures surface a message with
 * a way back to sign-in.
 */
export function useAcceptInvitationScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const { acceptInvitation } = useAuthActions()
  const [status, setStatus] = useState<AcceptInvitationStatus>("working")
  const [error, setError] = useState<string>()
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const run = async () => {
      if (!token) {
        setStatus("error")
        setError(translate("auth:acceptInvitation.missingCode"))
        return
      }
      const result = await acceptInvitation(token)
      if (!result.ok) {
        fireHaptic("error")
        setStatus("error")
        setError(result.error.message)
        return
      }
      fireHaptic("success")
      router.replace(result.data.kind === "select-employer" ? "/(auth)/select-employer" : "/")
    }

    void run()
  }, [token, acceptInvitation, router])

  const handleBackToSignIn = () => router.replace("/(auth)/sign-in")

  return { status, error, handleBackToSignIn }
}

export type AcceptInvitationScreenState = ReturnType<typeof useAcceptInvitationScreen>
