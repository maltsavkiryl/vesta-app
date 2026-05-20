import { useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { AppButton, SuccessState, Text, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { AuthError, AuthScaffold } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"

export function ForgotPasswordScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { requestPasswordReset, resetPassword } = useAuthActions()
  const [email, setEmail] = useState("")
  const [nextPassword, setNextPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"verify" | "reset" | "done">("verify")
  const [error, setError] = useState<string>()

  const handleVerify = async () => {
    if (!email.includes("@")) {
      fireHaptic("warning")
      setError("Enter your email to continue.")
      return
    }
    setError(undefined)
    const result = await requestPasswordReset(email)
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }
    fireHaptic("success")
    setStep("reset")
  }

  const handleReset = async () => {
    if (nextPassword.length < 6) {
      fireHaptic("warning")
      setError("Use a password with at least 6 characters.")
      return
    }

    if (nextPassword !== confirmPassword) {
      fireHaptic("warning")
      setError("The new passwords do not match.")
      return
    }

    setError(undefined)
    const result = await resetPassword({ email, nextPassword })
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }

    fireHaptic("success")
    setStep("done")
  }

  return (
    <AuthScaffold
      scrollEnabled={false}
      title={"Reset your\npassword."}
      subtitle={
        step === "verify"
          ? "Confirm your email to continue."
          : step === "reset"
            ? "Set a new password for this device."
            : "Your password has been updated on this device."
      }
    >
      {step === "done" ? (
        <SuccessState
          icon="checkmark-circle-outline"
          title="Password updated"
          subtitle={`You can now sign in with\n${email}`}
          tone="accent"
        >
          <Pressable onPress={() => router.replace("/(auth)/sign-in")} style={styles.textButton}>
            <Text
              text="Back to sign in"
              size="xs"
              weight="medium"
              style={{ color: tokens.accent }}
            />
          </Pressable>
        </SuccessState>
      ) : (
        <>
          <AuthError message={error} />
          <AuthTextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@email.com"
            returnKeyType={step === "verify" ? "done" : "next"}
            textContentType="username"
            value={email}
            onSubmitEditing={step === "verify" ? handleVerify : undefined}
          />
          {step === "reset" ? (
            <>
              <AuthTextField
                autoCapitalize="none"
                label="New password"
                onChangeText={setNextPassword}
                placeholder="At least 6 characters"
                returnKeyType="next"
                secureTextEntry
                textContentType="newPassword"
                value={nextPassword}
              />
              <AuthTextField
                autoCapitalize="none"
                label="Confirm password"
                onChangeText={setConfirmPassword}
                placeholder="Repeat your new password"
                returnKeyType="done"
                secureTextEntry
                textContentType="password"
                value={confirmPassword}
                onSubmitEditing={handleReset}
              />
            </>
          ) : null}
          <AppButton
            label={step === "verify" ? "Continue" : "Save new password"}
            onPress={step === "verify" ? handleVerify : handleReset}
            pressHaptic="none"
          />
          <AppButton
            label="Back to sign in"
            onPress={() => router.replace("/(auth)/sign-in")}
            variant="secondary"
          />
        </>
      )}
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  textButton: {
    marginTop: 8,
  },
})
