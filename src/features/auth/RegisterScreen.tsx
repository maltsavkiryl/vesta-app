import { useState } from "react"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { Button, MotionView, Text, appTypography, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { AuthError } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"

const vestaLogo = require("@assets/images/vesta-logo.png")

export function RegisterScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: tokens.backgroundMuted }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
            paddingTop: insets.top + 30,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotionView style={styles.header}>
          <VestaLogo />
          <Text
            text="Create account"
            weight="bold"
            style={[appTypography.authTitle, styles.centerText, { color: tokens.textPrimary }]}
          />
          <Text
            text="Add your details to continue."
            style={[
              appTypography.authSubtitle,
              styles.subtitle,
              styles.centerText,
              { color: tokens.textSecondary },
            ]}
          />
        </MotionView>

        <MotionView delay={70} style={styles.form}>
          <View style={styles.nameRow}>
            <AuthTextField
              accessibilityLabel="First name"
              autoCapitalize="words"
              autoComplete="given-name"
              containerStyle={styles.nameField}
              onChangeText={(value) => {
                setFirstName(value)
                clearError()
              }}
              label="First name"
              labelCase="default"
              placeholder="First name"
              returnKeyType="next"
              showLabel={false}
              textContentType="givenName"
              value={firstName}
            />
            <AuthTextField
              accessibilityLabel="Last name"
              autoCapitalize="words"
              autoComplete="family-name"
              containerStyle={styles.nameField}
              onChangeText={(value) => {
                setLastName(value)
                clearError()
              }}
              label="Last name"
              labelCase="default"
              placeholder="Last name"
              returnKeyType="next"
              showLabel={false}
              textContentType="familyName"
              value={lastName}
            />
          </View>

          <AuthTextField
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            labelCase="default"
            onChangeText={(value) => {
              setEmail(value)
              clearError()
            }}
            placeholder="Email"
            returnKeyType="next"
            showLabel={false}
            textContentType="username"
            value={email}
          />

          <AuthTextField
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="Password"
            labelCase="default"
            onChangeText={(value) => {
              setPassword(value)
              clearError()
            }}
            placeholder="Password"
            returnKeyType="next"
            secureTextEntry={!showPassword}
            showLabel={false}
            textContentType="newPassword"
            value={password}
            rightAccessory={
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={10}
                onPress={() => setShowPassword((current) => !current)}
                style={styles.iconButton}
              >
                <Ionicons
                  color={tokens.textSecondary}
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                />
              </Pressable>
            }
          />

          <AuthTextField
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="Confirm password"
            labelCase="default"
            onChangeText={(value) => {
              setConfirmPassword(value)
              clearError()
            }}
            onSubmitEditing={handleSubmit}
            placeholder="Confirm password"
            returnKeyType="done"
            secureTextEntry={!showPassword}
            showLabel={false}
            textContentType="newPassword"
            value={confirmPassword}
          />

          <AuthError message={error} />

          <Button fullWidth label="Create account" onPress={handleSubmit} pressHaptic="none" />
          <Button
            fullWidth
            label="Sign in instead"
            onPress={() => router.replace("/(auth)/sign-in")}
            variant="secondary"
          />
        </MotionView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function VestaLogo() {
  return (
    <Image
      accessibilityLabel="Vesta"
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={vestaLogo}
      style={styles.logo}
    />
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  form: {
    gap: 9,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  logo: {
    height: 76,
    marginBottom: 18,
    width: 76,
  },
  nameField: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 9,
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    marginTop: 6,
  },
})
