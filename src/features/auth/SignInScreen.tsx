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
      style={[styles.screen, { backgroundColor: tokens.backgroundMuted }]}
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
          <Text
            text="Log in or sign up"
            weight="bold"
            style={[styles.title, { color: tokens.textPrimary }]}
          />
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
            placeholder="Email"
            returnKeyType="next"
            showLabel={false}
            textContentType="username"
            value={email}
            rightAccessory={
              email.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear email"
                  hitSlop={10}
                  onPress={() => setEmail("")}
                  style={[styles.clearButton, { backgroundColor: tokens.textMuted }]}
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
            showLabel={false}
            textContentType="password"
            value={password}
            rightAccessory={
              password.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear password"
                  hitSlop={10}
                  onPress={() => setPassword("")}
                  style={[styles.clearButton, { backgroundColor: tokens.textMuted }]}
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

          <Button fullWidth label="Continue" onPress={handleContinue} />
          <Button
            fullWidth
            label="Register"
            onPress={() => router.replace("/(auth)/register")}
            variant="secondary"
          />

          <Text text="or" style={[styles.dividerText, { color: tokens.textSecondary }]} />

          <SocialButton
            icon="logo-google"
            label="Continue with Google"
            onPress={handleContinue}
            tokens={tokens}
          />
          <SocialButton
            icon="logo-apple"
            label="Continue with Apple"
            onPress={handleContinue}
            tokens={tokens}
          />
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
  tokens,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  tokens: ReturnType<typeof useDesignTokens>
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.socialButton,
        {
          backgroundColor: tokens.background,
          borderColor: tokens.border,
        },
      ]}
    >
      <Ionicons color={tokens.textPrimary} name={icon} size={21} />
      <Text
        text={label}
        weight="bold"
        style={[styles.socialButtonText, { color: tokens.textPrimary }]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  clearButton: {
    alignItems: "center",
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
    flex: 1,
  },
  socialButton: {
    alignItems: "center",
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
    fontSize: 17,
    lineHeight: 22,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
})
