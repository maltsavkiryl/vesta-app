import { useState } from "react"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { fireHaptic } from "@/utils/haptics"

/**
 * Drives the post-login employer picker shown when an identity is linked to more
 * than one employer. The pending employers are held by the auth layer from the
 * preceding sign-in; choosing one completes the session and routes into the app.
 */
export function useSelectEmployerScreen() {
  const router = useRouter()
  const { getPendingEmployers, selectEmployer } = useAuthActions()
  const employers = getPendingEmployers()
  const [selectingCode, setSelectingCode] = useState<string | null>(null)
  const [error, setError] = useState<string>()

  const handleSelect = async (employerUniqueCode: string) => {
    if (selectingCode) return
    setSelectingCode(employerUniqueCode)
    setError(undefined)
    try {
      const result = await selectEmployer(employerUniqueCode)
      if (!result.ok) {
        fireHaptic("error")
        setError(result.error.message)
        return
      }
      fireHaptic("success")
      router.replace("/")
    } finally {
      setSelectingCode(null)
    }
  }

  const handleBackToSignIn = () => router.replace("/(auth)/sign-in")

  return { employers, error, handleBackToSignIn, handleSelect, selectingCode }
}

export type SelectEmployerScreenState = ReturnType<typeof useSelectEmployerScreen>
