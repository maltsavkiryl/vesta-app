/* eslint-disable react-native/no-color-literals */

import { useState } from "react"
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { DEMO_AUTH_CREDENTIALS } from "@/providers/app-provider"
import { Banner, Button, Text, useDesignTokens } from "@/ui"

import { AuthTextField } from "./AuthTextField"

const vestaLogo = require("@assets/images/vesta-logo.png")

export function SignInScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { signIn } = useAuthActions()

  const [email, setEmail] = useState<string>(DEMO_AUTH_CREDENTIALS.email)
  const [password, setPassword] = useState<string>(DEMO_AUTH_CREDENTIALS.password)
  const [error, setError] = useState<string>()

  const handleContinue = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    const result = await signIn({ email, password })
    if (!result.ok) {
      setError(result.error.message)
      return
    }

    setError(undefined)
    router.replace("/")
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
            paddingTop: insets.top + 30,
          },
        ]}
      >
        <View style={styles.header}>
          <VestaLogo />
          <Text text="Log in or sign up" weight="bold" style={styles.title} />
        </View>

        <View style={styles.form}>
          <AuthTextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            labelCase="default"
            onChangeText={(value) => {
              setEmail(value)
              if (error) setError(undefined)
            }}
            onSubmitEditing={handleContinue}
            placeholder="you@email.com"
            returnKeyType="next"
            textContentType="username"
            value={email}
            rightAccessory={
              email.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear email"
                  hitSlop={10}
                  onPress={() => setEmail("")}
                  style={styles.clearButton}
                >
                  <Ionicons color={tokens.accentForeground} name="close" size={12} />
                </Pressable>
              ) : null
            }
          />

          <AuthTextField
            autoCapitalize="none"
            autoComplete="off"
            label="Password"
            labelCase="default"
            onChangeText={(value) => {
              setPassword(value)
              if (error) setError(undefined)
            }}
            onSubmitEditing={handleContinue}
            placeholder="Password"
            returnKeyType="done"
            secureTextEntry
            textContentType="password"
            value={password}
            rightAccessory={
              password.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear password"
                  hitSlop={10}
                  onPress={() => setPassword("")}
                  style={styles.clearButton}
                >
                  <Ionicons color={tokens.accentForeground} name="close" size={12} />
                </Pressable>
              ) : null
            }
          />

          {error ? (
            <Banner tone="danger">
              <Text text={error} size="xxs" />
            </Banner>
          ) : null}

          <Button label="Continue" onPress={handleContinue} />
          <Button
            label="Register"
            onPress={() => router.replace("/(auth)/register")}
            variant="secondary"
          />

          <Text text="or" style={styles.dividerText} />

          <SocialButton icon="logo-google" label="Continue with Google" onPress={handleContinue} />
          <SocialButton icon="logo-apple" label="Continue with Apple" onPress={handleContinue} />
        </View>
      </View>
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

function SocialButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={styles.socialButton}>
      <Ionicons color="#000000" name={icon} size={21} />
      <Text text={label} weight="bold" style={styles.socialButtonText} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  clearButton: {
    alignItems: "center",
    backgroundColor: "#B7B7BA",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  dividerText: {
    color: "#6C6C70",
    fontSize: 18,
    lineHeight: 22,
    marginVertical: 2,
    textAlign: "center",
  },
  form: {
    alignItems: "stretch",
    gap: 9,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    height: 53,
    marginBottom: 18,
    width: 53,
  },
  screen: {
    backgroundColor: "#F9F9FA",
    flex: 1,
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "#F9F9FA",
    borderColor: "#C9C9CC",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    width: "100%",
  },
  socialButtonText: {
    color: "#000000",
    fontSize: 17,
    lineHeight: 22,
  },
  title: {
    color: "#000000",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
})
