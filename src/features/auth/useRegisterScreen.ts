import { useState } from "react"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
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

  const clearError = () => {
    if (error) setError(undefined)
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      fireHaptic("warning")
      setError("Please enter your full name.")
      return
    }

    if (!email.includes("@")) {
      fireHaptic("warning")
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      fireHaptic("warning")
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      fireHaptic("warning")
      setError("Passwords don't match.")
      return
    }

    setError(undefined)
    const result = await register({ firstName, lastName, email, password })
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }

    fireHaptic("success")
    router.replace("/(auth)/onboarding")
  }

  return {
    confirmPassword,
    email,
    error,
    firstName,
    handleSubmit,
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
