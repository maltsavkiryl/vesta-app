/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { AppButton } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

import { AuthError, AuthScaffold } from "./AuthScaffold"

export function ForgotPasswordScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { requestPasswordReset } = useAppSession()
  const [email, setEmail] = useState("sofia.fischer@email.com")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>()

  const handleReset = () => {
    if (!email.includes("@")) {
      setError("Enter your email to reset your password.")
      return
    }
    setError(undefined)
    requestPasswordReset(email)
    setSubmitted(true)
  }

  return (
    <AuthScaffold title={"Reset your\npassword."} subtitle="We'll send a reset link to your email.">
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
          <View style={[styles.fieldShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="EMAIL" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={tokens.textMuted}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={email}
            />
          </View>
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
  fieldShell: {
    borderRadius: 14,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nativeInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 24,
    padding: 0,
  },
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
