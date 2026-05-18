/* eslint-disable react-native/no-color-literals */

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
import { Banner, Button, Text, useDesignTokens } from "@/ui"

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
    const response = await register({ firstName, lastName, email, password })
    if (!response.result.ok) {
      setError(response.result.message)
      return
    }
    router.replace("/(auth)/onboarding")
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
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
        <View style={styles.header}>
          <VestaLogo />
          <Text text="Create account" weight="bold" style={styles.title} />
          <Text text="Add your details to continue." style={styles.subtitle} />
        </View>

        <View style={styles.form}>
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
              returnKeyType="next"
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
              returnKeyType="next"
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
            placeholder="you@email.com"
            returnKeyType="next"
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
            returnKeyType="next"
            secureTextEntry={!showPassword}
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
            returnKeyType="done"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            value={confirmPassword}
          />

          {error ? (
            <Banner tone="danger">
              <Text text={error} size="xxs" />
            </Banner>
          ) : null}

          <Button label="Create account" onPress={handleSubmit} />
          <Button
            label="Sign in instead"
            onPress={() => router.replace("/(auth)/sign-in")}
            variant="secondary"
          />
        </View>
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
    backgroundColor: "#F9F9FA",
    flex: 1,
  },
  subtitle: {
    color: "#6C6C70",
    fontSize: 16,
    lineHeight: 21,
    marginTop: 6,
    textAlign: "center",
  },
  title: {
    color: "#000000",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
})
