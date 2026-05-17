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

export function SignInScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { signIn } = useAppSession()

  const [email, setEmail] = useState("sofia.fischer@email.com")
  const [password, setPassword] = useState("password123")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (!password.trim()) {
      setError("Please enter your password.")
      return
    }
    setError(undefined)
    signIn({ email, password })
    router.replace("/")
  }

  return (
    <AuthScaffold
      title={"Welcome\nback."}
      subtitle="Sign in to manage your work life."
      footer={
        <View style={styles.footerRow}>
          <Text text="Don't have an account?" size="xs" style={{ color: tokens.textSecondary }} />
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text text="Create one" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
          </Pressable>
        </View>
      }
    >
      <AuthError message={error} />
      <View style={styles.formStack}>
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
        <View style={[styles.fieldShell, { backgroundColor: tokens.searchBackground }]}>
          <Text text="PASSWORD" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
          <View style={styles.passwordRow}>
            <TextInput
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={tokens.textMuted}
              secureTextEntry={!showPassword}
              style={[styles.nativeInput, styles.flex, { color: tokens.textPrimary }]}
              value={password}
            />
            <Pressable
              onPress={() => setShowPassword((current) => !current)}
              style={styles.eyeButton}
            >
              <Ionicons
                color={tokens.textMuted}
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable onPress={() => router.push("/(auth)/forgot-password")} style={styles.forgotButton}>
        <Text text="Forgot password?" size="xxs" weight="medium" style={{ color: tokens.accent }} />
      </Pressable>

      <AppButton label="Sign in" onPress={handleSubmit} />

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: tokens.border }]} />
        <Text text="or continue with" size="xxs" style={{ color: tokens.textMuted }} />
        <View style={[styles.divider, { backgroundColor: tokens.border }]} />
      </View>

      <Pressable
        onPress={handleSubmit}
        style={[
          styles.biometricButton,
          {
            backgroundColor: tokens.background,
            borderColor: tokens.border,
          },
        ]}
      >
        <Ionicons color={tokens.textMuted} name="finger-print-outline" size={22} />
        <Text
          text="Face ID / Touch ID"
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
      </Pressable>
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  biometricButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    padding: 14,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginVertical: 4,
  },
  eyeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  fieldShell: {
    borderRadius: 14,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex: {
    flex: 1,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  forgotButton: {
    alignItems: "flex-end",
  },
  formStack: {
    gap: 10,
  },
  nativeInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 24,
    padding: 0,
  },
  passwordRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})
