/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { AppButton, Text, useDesignTokens } from "@/ui"

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
    await requestPasswordReset(email)
    setSubmitted(true)
  }

  return (
    <AuthScaffold
      scrollEnabled={false}
      title={"Reset your\npassword."}
      subtitle="We'll send a reset link to your email."
    >
      {submitted ? (
        <View style={styles.sentState}>
          <View style={[styles.sentIcon, { backgroundColor: tokens.accentSoft }]}>
            <Ionicons color={tokens.accent} name="checkmark-outline" size={30} />
          </View>
          <Text
            text="Check your inbox"
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 20, lineHeight: 25, textAlign: "center" }}
          />
          <Text
            text={`We sent a reset link to\n${email}`}
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <Pressable onPress={() => router.replace("/(auth)/sign-in")} style={styles.textButton}>
            <Text
              text="Back to sign in"
              size="xs"
              weight="medium"
              style={{ color: tokens.accent }}
            />
          </Pressable>
        </View>
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
  sentIcon: {
    alignItems: "center",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  sentState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  textButton: {
    marginTop: 8,
  },
})
