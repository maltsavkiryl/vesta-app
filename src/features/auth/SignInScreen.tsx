/* eslint-disable react-native/no-color-literals */

import { useState } from "react"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { DEMO_AUTH_CREDENTIALS, useAppSession } from "@/providers/app-provider"

const vestaLogo = require("@assets/images/vesta-logo.png")

export function SignInScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { signIn } = useAppSession()

  const [email, setEmail] = useState<string>(DEMO_AUTH_CREDENTIALS.email)
  const [password, setPassword] = useState<string>(DEMO_AUTH_CREDENTIALS.password)
  const [error, setError] = useState<string>()

  const handleContinue = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    const result = signIn({ email, password })
    if (!result.ok) {
      setError(result.message)
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
          <View style={styles.inputShell}>
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value)
                if (error) setError(undefined)
              }}
              onSubmitEditing={handleContinue}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              returnKeyType="done"
              selectionColor="#000000"
              style={styles.input}
              textContentType="username"
              value={email}
            />
            {email.length > 0 ? (
              <Pressable
                accessibilityLabel="Clear email"
                hitSlop={10}
                onPress={() => setEmail("")}
                style={styles.clearButton}
              >
                <Ionicons color="#FFFFFF" name="close" size={12} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.inputShell}>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              secureTextEntry
              onChangeText={(value) => {
                setPassword(value)
                if (error) setError(undefined)
              }}
              onSubmitEditing={handleContinue}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              returnKeyType="done"
              selectionColor="#000000"
              style={styles.input}
              value={password}
              textContentType="password"
            />
            {password.length > 0 ? (
              <Pressable
                accessibilityLabel="Clear password"
                hitSlop={10}
                onPress={() => setPassword("")}
                style={styles.clearButton}
              >
                <Ionicons color="#FFFFFF" name="close" size={12} />
              </Pressable>
            ) : null}
          </View>

          {error ? <Text text={error} size="xxs" style={styles.errorText} /> : null}

          <Pressable onPress={handleContinue} style={styles.primaryButton}>
            <Text text="Continue" weight="bold" style={styles.primaryButtonText} />
          </Pressable>

          <Pressable onPress={() => router.replace("/(auth)/register")} style={styles.registerButton}>
            <Text text="Register" weight="bold" style={styles.registerButtonText} />
          </Pressable>

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
  registerButton: {
    alignItems: "center",
    backgroundColor: "#F9F9FA",
    borderColor: "#C9C9CC",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  registerButtonText: {
    color: "#000000",
    fontSize: 17,
    lineHeight: 22,
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
