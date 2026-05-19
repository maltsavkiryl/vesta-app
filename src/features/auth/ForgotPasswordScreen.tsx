import { useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { AppButton, SuccessState, Text, useDesignTokens } from "@/ui"

import { AuthError, AuthScaffold } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"

export function ForgotPasswordScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { requestPasswordReset } = useAuthActions()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>()

  const handleReset = async () => {
    if (!email.includes("@")) {
      setError("Enter your email to reset your password.")
      return
    }
    setError(undefined)
    const result = await requestPasswordReset(email)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setSubmitted(true)
  }

  return (
    <AuthScaffold
      scrollEnabled={false}
      title={"Reset your\npassword."}
      subtitle="We'll send a reset link to your email."
    >
      {submitted ? (
        <SuccessState
          icon="mail-outline"
          title="Check your inbox"
          subtitle={`We sent a reset link to\n${email}`}
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
            returnKeyType="done"
            textContentType="username"
            value={email}
            onSubmitEditing={handleReset}
          />
          <AppButton label="Send reset link" onPress={handleReset} />
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
