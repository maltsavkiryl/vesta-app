import { useState } from "react"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { DEMO_AUTH_CREDENTIALS } from "@/providers/app-provider"
import { fireHaptic } from "@/utils/haptics"

export function useSignInScreen() {
  const router = useRouter()
  const { signIn } = useAuthActions()

  const [email, setEmail] = useState<string>(DEMO_AUTH_CREDENTIALS.email)
  const [password, setPassword] = useState<string>(DEMO_AUTH_CREDENTIALS.password)
  const [error, setError] = useState<string>()

  const clearError = () => {
    if (error) setError(undefined)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    clearError()
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    clearError()
  }

  const handleContinue = async () => {
    if (!email.includes("@")) {
      fireHaptic("warning")
      setError("Please enter a valid email address.")
      return
    }

    const result = await signIn({ email, password })
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }

    fireHaptic("success")
    setError(undefined)
    router.replace("/")
  }

  return {
    clearEmail: () => setEmail(""),
    clearPassword: () => setPassword(""),
    email,
    error,
    handleContinue,
    handleEmailChange,
    handlePasswordChange,
    password,
    router,
  }
}

export type SignInScreenState = ReturnType<typeof useSignInScreen>
