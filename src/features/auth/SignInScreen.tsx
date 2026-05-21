import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, MotionView, Text, useDesignTokens } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthLogo } from "./AuthLogo"
import { AuthError } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"
import { useSignInScreen } from "./useSignInScreen"

const palette = {
  canvas: "#020408",
  backgroundGradient: ["#020408", "#050919", "#0A1428"] as const,
  backCircleBg: "rgba(255, 255, 255, 0.08)",
  clearButton: "rgba(255, 255, 255, 0.12)",
  divider: "rgba(255, 255, 255, 0.12)",
  emailButtonBg: "rgba(60, 110, 220, 0.88)",
  emailButtonText: "#F4F7FF",
  fieldBackground: "rgba(255, 255, 255, 0.07)",
  fieldBorder: "rgba(83, 145, 255, 0.20)",
  fieldPlaceholder: "rgba(214, 225, 255, 0.48)",
  fieldText: "#F4F7FF",
  heroMuted: "rgba(214, 225, 255, 0.66)",
  heroText: "#F4F7FF",
  panelBorder: "rgba(83, 145, 255, 0.22)",
  panelMuted: "rgba(214, 225, 255, 0.66)",
  panelText: "#F4F7FF",
  socialBg: "rgba(255, 255, 255, 0.07)",
  socialBorder: "rgba(83, 145, 255, 0.22)",
  socialText: "#F4F7FF",
}

export function SignInScreen() {
  const [showForm, setShowForm] = useState(false)
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const {
    clearEmail,
    clearPassword,
    email,
    error,
    handleContinue,
    handleEmailChange,
    handlePasswordChange,
    password,
    router,
  } = useSignInScreen()

  if (showForm) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.screen, { backgroundColor: palette.canvas }]}
      >
        <AuthBackgroundLayers />
        <View
          style={[
            styles.landingMain,
            {
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <View style={styles.formTopBar}>
            <Pressable
              hitSlop={8}
              onPress={() => setShowForm(false)}
              style={[
                styles.backButton,
                {
                  backgroundColor: palette.backCircleBg,
                  borderColor: palette.panelBorder,
                },
              ]}
            >
              <Ionicons color={palette.panelText} name="chevron-back" size={18} />
            </Pressable>
          </View>

          <View style={styles.formHeroSection}>
            <AuthLogo style={styles.formLogo} />
          </View>

          <View
            style={[
              styles.bottomContent,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.formHeader}>
              <Text
                text="Log in with email"
                size="sm"
                weight="semiBold"
                style={{ color: palette.panelText }}
              />
              <Text
                text="Use the same work account you use for planning and timesheets."
                size="xxs"
                style={{ color: palette.panelMuted }}
              />
            </View>

            <View style={styles.form}>
              <AuthTextField
                autoCapitalize="none"
                autoComplete="email"
                containerStyle={[
                  styles.textField,
                  {
                    backgroundColor: palette.fieldBackground,
                    borderColor: palette.fieldBorder,
                  },
                ]}
                keyboardType="email-address"
                label="Email"
                labelCase="default"
                onChangeText={handleEmailChange}
                onSubmitEditing={handleContinue}
                placeholder="Email"
                placeholderTextColor={palette.fieldPlaceholder}
                returnKeyType="next"
                showLabel={false}
                style={{ color: palette.fieldText }}
                textContentType="username"
                value={email}
                rightAccessory={
                  email.length > 0 ? (
                    <AuthAccessoryButton
                      accessibilityLabel="Clear email"
                      icon="close"
                      onPress={clearEmail}
                      style={[styles.clearButton, { backgroundColor: palette.clearButton }]}
                    />
                  ) : null
                }
              />

              <AuthTextField
                autoCapitalize="none"
                autoComplete="off"
                containerStyle={[
                  styles.textField,
                  {
                    backgroundColor: palette.fieldBackground,
                    borderColor: palette.fieldBorder,
                  },
                ]}
                label="Password"
                labelCase="default"
                onChangeText={handlePasswordChange}
                onSubmitEditing={handleContinue}
                placeholder="Password"
                placeholderTextColor={palette.fieldPlaceholder}
                returnKeyType="done"
                secureTextEntry
                showLabel={false}
                style={{ color: palette.fieldText }}
                textContentType="password"
                value={password}
                rightAccessory={
                  password.length > 0 ? (
                    <AuthAccessoryButton
                      accessibilityLabel="Clear password"
                      icon="close"
                      onPress={clearPassword}
                      style={[styles.clearButton, { backgroundColor: palette.clearButton }]}
                    />
                  ) : null
                }
              />

              <Pressable
                hitSlop={8}
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.inlineLinkRow}
              >
                <Text
                  text="Forgot password?"
                  size="xxs"
                  weight="medium"
                  style={{ color: tokens.accent }}
                />
              </Pressable>

              <AuthError message={error} />

              <Button
                fullWidth
                label="Log in with email"
                onPress={handleContinue}
                pressHaptic="none"
              />

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: palette.divider }]} />
                <Text text="or" size="xxs" style={{ color: palette.panelMuted }} />
                <View style={[styles.dividerLine, { backgroundColor: palette.divider }]} />
              </View>

              <Button
                fullWidth
                label="Create account"
                onPress={() => router.replace("/(auth)/register")}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.canvas }]}>
      <AuthBackgroundLayers />

      <View style={[styles.landingMain, { paddingTop: insets.top + 24 }]}>
        {/* Vesta logo */}
        <MotionView style={styles.heroSection}>
          <AuthLogo style={styles.logo} />
        </MotionView>

        <MotionView
          delay={80}
          style={[styles.bottomContent, { paddingBottom: Math.max(insets.bottom, 32) }]}
        >
          <View style={styles.textBlock}>
            <Text
              text={"Your work life,\nsimplified"}
              size="xl"
              weight="bold"
              style={[styles.headline, { color: palette.heroText }]}
            />
            <Text
              text="Shifts, timesheets, and payroll — everything you need, in one place."
              size="xs"
              style={[styles.subtitle, { color: palette.heroMuted }]}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Pressable
              onPress={() => setShowForm(true)}
              style={({ pressed }) => [
                styles.emailButton,
                { backgroundColor: palette.emailButtonBg, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text
                text="Log in with email"
                size="xs"
                weight="semiBold"
                style={{ color: palette.emailButtonText }}
              />
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: palette.divider }]} />
              <Text text="or continue with" size="xxs" style={{ color: palette.heroMuted }} />
              <View style={[styles.dividerLine, { backgroundColor: palette.divider }]} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: palette.socialBg,
                  borderColor: palette.socialBorder,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Ionicons color={palette.socialText} name="logo-apple" size={18} />
              <Text
                text="Continue with Apple"
                size="xs"
                weight="medium"
                style={{ color: palette.socialText }}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: palette.socialBg,
                  borderColor: palette.socialBorder,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Ionicons color={palette.socialText} name="logo-google" size={16} />
              <Text
                text="Continue with Google"
                size="xs"
                weight="medium"
                style={{ color: palette.socialText }}
              />
            </Pressable>
          </View>
        </MotionView>
      </View>
    </View>
  )
}

function AuthBackgroundLayers() {
  return (
    <>
      <LinearGradient
        colors={palette.backgroundGradient}
        end={{ x: 0.92, y: 0.08 }}
        start={{ x: 0.08, y: 0.98 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "rgba(60, 110, 220, 0.18)",
          "rgba(60, 110, 220, 0.07)",
          "rgba(60, 110, 220, 0.00)",
        ]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0.4, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "rgba(100, 140, 220, 0.09)",
          "rgba(100, 140, 220, 0.04)",
          "rgba(100, 140, 220, 0.00)",
        ]}
        end={{ x: 0.3, y: 0.55 }}
        pointerEvents="none"
        start={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  // Form view
  backButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    marginBottom: 20,
    width: 32,
  },
  clearButton: {
    alignItems: "center",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  form: {
    alignItems: "stretch",
    gap: 12,
  },
  formHeader: {
    gap: 4,
  },
  formHeroSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  formLogo: {
    height: 84,
    width: 84,
  },
  formTopBar: {
    paddingHorizontal: 24,
  },
  inlineLinkRow: {
    alignItems: "flex-end",
  },
  textField: {
    minHeight: 58,
  },

  // Landing view
  landingMain: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    height: 96,
    width: 96,
  },

  // Bottom content
  bottomContent: {
    gap: 24,
    paddingHorizontal: 24,
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  headline: {
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 300,
    textAlign: "center",
  },
  buttonGroup: {
    gap: 12,
  },
  emailButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    height: 56,
    justifyContent: "center",
  },
  socialButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    height: 52,
    justifyContent: "center",
  },
})
