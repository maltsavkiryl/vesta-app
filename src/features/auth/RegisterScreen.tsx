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

export function RegisterScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { register } = useAppSession()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name.")
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setError(undefined)
    register({ firstName, lastName, email, password })
    router.replace("/(auth)/onboarding")
  }

  return (
    <AuthScaffold
      title={"Create your\naccount."}
      subtitle="Join thousands of employees on Vesta."
      footer={
        <View style={styles.footerRow}>
          <Text text="Already have an account?" size="xs" style={{ color: tokens.textSecondary }} />
          <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
            <Text text="Sign in" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
          </Pressable>
        </View>
      }
    >
      <AuthError message={error} />
      <View style={styles.formStack}>
        <View style={styles.nameRow}>
          <View style={styles.flex}>
            <View style={[styles.fieldShell, { backgroundColor: tokens.searchBackground }]}>
              <Text
                text="FIRST NAME"
                size="xxs"
                weight="medium"
                style={{ color: tokens.textMuted }}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={setFirstName}
                placeholder="Sofia"
                placeholderTextColor={tokens.textMuted}
                style={[styles.nativeInput, { color: tokens.textPrimary }]}
                value={firstName}
              />
            </View>
          </View>
          <View style={styles.flex}>
            <View style={[styles.fieldShell, { backgroundColor: tokens.searchBackground }]}>
              <Text
                text="LAST NAME"
                size="xxs"
                weight="medium"
                style={{ color: tokens.textMuted }}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={setLastName}
                placeholder="Fischer"
                placeholderTextColor={tokens.textMuted}
                style={[styles.nativeInput, { color: tokens.textPrimary }]}
                value={lastName}
              />
            </View>
          </View>
        </View>
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
        <View style={[styles.fieldShell, { backgroundColor: tokens.searchBackground }]}>
          <Text
            text="CONFIRM PASSWORD"
            size="xxs"
            weight="medium"
            style={{ color: tokens.textMuted }}
          />
          <TextInput
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={tokens.textMuted}
            secureTextEntry={!showPassword}
            style={[styles.nativeInput, { color: tokens.textPrimary }]}
            value={confirmPassword}
          />
        </View>
      </View>

      <AppButton label="Create account" onPress={handleSubmit} />
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
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
  formStack: {
    gap: 10,
  },
  nameRow: {
    flexDirection: "row",
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
