/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { AppButton } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

import { AuthError, AuthScaffold } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"

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
      scrollEnabled={false}
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
            <AuthTextField
              autoCapitalize="words"
              autoComplete="given-name"
              label="First name"
              onChangeText={setFirstName}
              placeholder="Sofia"
              returnKeyType="next"
              textContentType="givenName"
              value={firstName}
            />
          </View>
          <View style={styles.flex}>
            <AuthTextField
              autoCapitalize="words"
              autoComplete="family-name"
              label="Last name"
              onChangeText={setLastName}
              placeholder="Fischer"
              returnKeyType="next"
              textContentType="familyName"
              value={lastName}
            />
          </View>
        </View>
        <AuthTextField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@email.com"
          returnKeyType="next"
          textContentType="username"
          value={email}
        />
        <AuthTextField
          autoComplete="new-password"
          label="Password"
          onChangeText={setPassword}
          placeholder="Password"
          returnKeyType="next"
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          value={password}
          rightAccessory={
            <Pressable
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              onPress={() => setShowPassword((current) => !current)}
              style={styles.eyeButton}
            >
              <Ionicons
                color={tokens.textMuted}
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
              />
            </Pressable>
          }
        />
        <AuthTextField
          autoComplete="new-password"
          label="Confirm password"
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          returnKeyType="done"
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          value={confirmPassword}
          onSubmitEditing={handleSubmit}
        />
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
})
