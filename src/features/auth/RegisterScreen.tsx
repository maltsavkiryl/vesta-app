/* eslint-disable react-native/no-color-literals */

import { useState } from "react"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native"
import type { ReactNode } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { useAppSession } from "@/providers/app-provider"

const vestaLogo = require("@assets/images/vesta-logo.png")

export function RegisterScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { register } = useAppSession()

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
            <Field
              accessibilityLabel="First name"
              autoCapitalize="words"
              autoComplete="given-name"
              onChangeText={(value) => {
                setFirstName(value)
                clearError()
              }}
              placeholder="First name"
              returnKeyType="next"
              textContentType="givenName"
              value={firstName}
            />
            <Field
              accessibilityLabel="Last name"
              autoCapitalize="words"
              autoComplete="family-name"
              onChangeText={(value) => {
                setLastName(value)
                clearError()
              }}
              placeholder="Last name"
              returnKeyType="next"
              textContentType="familyName"
              value={lastName}
            />
          </View>

          <Field
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={(value) => {
              setEmail(value)
              clearError()
            }}
            placeholder="Email"
            returnKeyType="next"
            textContentType="username"
            value={email}
          />

          <Field
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={(value) => {
              setPassword(value)
              clearError()
            }}
            placeholder="Password"
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
                  color="#6C6C70"
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                />
              </Pressable>
            }
          />

          <Field
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={(value) => {
              setConfirmPassword(value)
              clearError()
            }}
            onSubmitEditing={handleSubmit}
            placeholder="Confirm password"
            returnKeyType="done"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            value={confirmPassword}
          />

          {error ? <Text text={error} size="xxs" style={styles.errorText} /> : null}

          <Pressable onPress={handleSubmit} style={styles.primaryButton}>
            <Text text="Create account" weight="bold" style={styles.primaryButtonText} />
          </Pressable>

          <Pressable onPress={() => router.replace("/(auth)/sign-in")} style={styles.secondaryButton}>
            <Text text="Sign in instead" weight="bold" style={styles.secondaryButtonText} />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({
  containerStyle,
  rightAccessory,
  ...props
}: TextInputProps & { containerStyle?: StyleProp<ViewStyle>; rightAccessory?: ReactNode }) {
  return (
    <View style={[styles.inputShell, containerStyle]}>
      <TextInput
        autoCorrect={false}
        placeholderTextColor="#8E8E93"
        selectionColor="#000000"
        {...props}
        style={styles.input}
      />
      {rightAccessory}
    </View>
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
  errorText: {
    color: "#D70015",
    marginTop: -4,
    textAlign: "center",
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
  input: {
    color: "#000000",
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    minHeight: 22,
    padding: 0,
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: "#E8E8EA",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  logo: {
    height: 76,
    marginBottom: 18,
    width: 76,
  },
  nameRow: {
    flexDirection: "row",
    gap: 9,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 22,
  },
  screen: {
    backgroundColor: "#F9F9FA",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#F9F9FA",
    borderColor: "#C9C9CC",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 17,
    lineHeight: 22,
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
