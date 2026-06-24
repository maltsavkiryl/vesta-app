import { useState } from "react"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

export function useRegisterScreen() {
  const router = useRouter()
  const { register } = useAuthActions()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = () => {
    if (error) setError(undefined)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!firstName.trim() || !lastName.trim()) {
      fireHaptic("warning")
      setError(translate("auth:validation.nameRequired"))
      return
    }

    if (!email.includes("@")) {
      fireHaptic("warning")
      setError(translate("auth:validation.emailInvalid"))
      return
    }

    if (password.length < 8) {
      fireHaptic("warning")
      setError(translate("auth:validation.passwordMin8"))
      return
    }

    if (password !== confirmPassword) {
      fireHaptic("warning")
      setError(translate("auth:validation.passwordsMismatch"))
      return
    }

    setError(undefined)
    setIsSubmitting(true)
    try {
      const result = await register({ firstName, lastName, email, password })
      if (!result.ok) {
        fireHaptic("error")
        setError(result.error.message)
        return
      }
      fireHaptic("success")
      router.replace("/(auth)/onboarding")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    confirmPassword,
    email,
    error,
    firstName,
    handleSubmit,
    isSubmitting,
    lastName,
    password,
    router,
    setConfirmPassword: (value: string) => {
      setConfirmPassword(value)
      clearError()
    },
    setEmail: (value: string) => {
      setEmail(value)
      clearError()
    },
    setFirstName: (value: string) => {
      setFirstName(value)
      clearError()
    },
    setLastName: (value: string) => {
      setLastName(value)
      clearError()
    },
    setPassword: (value: string) => {
      setPassword(value)
      clearError()
    },
    showPassword,
    toggleShowPassword: () => setShowPassword((current) => !current),
  }
}

export type RegisterScreenState = ReturnType<typeof useRegisterScreen>
