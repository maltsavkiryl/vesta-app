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

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()

  const useDemoCredentials = () => {
    setEmail(DEMO_AUTH_CREDENTIALS.email)
    setError(undefined)
  }

  const handleContinue = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    const result = signIn({ email, password: DEMO_AUTH_CREDENTIALS.password })
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
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons color="#1F64DF" name="sparkles-outline" size={18} />
              <Text text="Demo account" weight="bold" style={styles.demoTitle} />
            </View>
            <View style={styles.demoRows}>
              <CredentialRow label="Email" value={DEMO_AUTH_CREDENTIALS.email} />
              <CredentialRow label="Password" value={DEMO_AUTH_CREDENTIALS.password} />
            </View>
            <Pressable onPress={useDemoCredentials} style={styles.demoButton}>
              <Text text="Use demo account" weight="bold" style={styles.demoButtonText} />
            </Pressable>
          </View>

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

          {error ? <Text text={error} size="xxs" style={styles.errorText} /> : null}

          <Pressable onPress={handleContinue} style={styles.primaryButton}>
            <Text text="Continue" weight="bold" style={styles.primaryButtonText} />
          </Pressable>

          <Text text="or" style={styles.dividerText} />

          <SocialButton icon="logo-google" label="Continue with Google" onPress={handleContinue} />
          <SocialButton icon="logo-apple" label="Continue with Apple" onPress={handleContinue} />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.credentialRow}>
      <Text text={label} size="xxs" style={styles.credentialLabel} />
      <Text text={value} size="xxs" weight="semiBold" style={styles.credentialValue} />
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
  credentialLabel: {
    color: "#6C6C70",
    minWidth: 58,
  },
  credentialRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  credentialValue: {
    color: "#000000",
    flex: 1,
  },
  demoButton: {
    alignItems: "center",
    backgroundColor: "#EAF1FF",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 38,
  },
  demoButtonText: {
    color: "#1F64DF",
    fontSize: 14,
    lineHeight: 18,
  },
  demoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E4FF",
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
    padding: 14,
  },
  demoHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  demoRows: {
    gap: 5,
  },
  demoTitle: {
    color: "#000000",
    fontSize: 15,
    lineHeight: 20,
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
