import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { MotionView, Text } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"

import { AuthBackgroundLayers, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthLogo } from "./AuthLogo"
import { AuthError } from "./AuthScaffold"
import { useSocialSignIn } from "./useSocialSignIn"

function SignInButton({
  accessibilityLabel,
  busy = false,
  children,
  disabled = false,
  onPress,
  style,
}: {
  accessibilityLabel: string
  busy?: boolean
  children: React.ReactNode
  disabled?: boolean
  onPress: () => void
  style: object | object[]
}) {
  const { animatedStyle, pressHandlers } = usePressScale({ pressedScale: 0.97 })

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ busy, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[
          Array.isArray(style) ? StyleSheet.flatten(style) : style,
          disabled && !busy ? styles.buttonDisabled : null,
        ]}
        {...pressHandlers}
      >
        {busy ? <ActivityIndicator color={AUTH_SCREEN_PALETTE.socialText} /> : children}
      </Pressable>
    </Animated.View>
  )
}

export function SignInScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { error, handleGoogle, pendingProvider } = useSocialSignIn()
  const isBusy = pendingProvider !== null

  const startSignIn = () => router.push("/(auth)/sign-in-email")

  return (
    <View style={[styles.screen, { backgroundColor: AUTH_SCREEN_PALETTE.canvas }]}>
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
              style={[styles.headline, { color: AUTH_SCREEN_PALETTE.heroText }]}
            />
            <Text
              text="Shifts, timesheets, and payroll — everything you need, in one place."
              size="xs"
              style={[styles.subtitle, { color: AUTH_SCREEN_PALETTE.heroMuted }]}
            />
          </View>

          <View style={styles.buttonGroup}>
            <SignInButton
              accessibilityLabel="Log in with email"
              disabled={isBusy}
              onPress={startSignIn}
              style={[styles.emailButton, { backgroundColor: AUTH_SCREEN_PALETTE.emailButtonBg }]}
            >
              <Text
                text="Log in with email"
                size="xs"
                weight="semiBold"
                style={{ color: AUTH_SCREEN_PALETTE.emailButtonText }}
              />
            </SignInButton>

            <View style={styles.dividerRow}>
              <View
                style={[styles.dividerLine, { backgroundColor: AUTH_SCREEN_PALETTE.divider }]}
              />
              <Text
                text="or continue with"
                size="xxs"
                style={{ color: AUTH_SCREEN_PALETTE.heroMuted }}
              />
              <View
                style={[styles.dividerLine, { backgroundColor: AUTH_SCREEN_PALETTE.divider }]}
              />
            </View>

            <SignInButton
              accessibilityLabel="Continue with Apple"
              disabled={isBusy}
              onPress={startSignIn}
              style={[
                styles.socialButton,
                {
                  backgroundColor: AUTH_SCREEN_PALETTE.socialBg,
                  borderColor: AUTH_SCREEN_PALETTE.socialBorder,
                },
              ]}
            >
              <Ionicons color={AUTH_SCREEN_PALETTE.socialText} name="logo-apple" size={18} />
              <Text
                text="Continue with Apple"
                size="xs"
                weight="medium"
                style={{ color: AUTH_SCREEN_PALETTE.socialText }}
              />
            </SignInButton>

            <SignInButton
              accessibilityLabel="Continue with Google"
              busy={pendingProvider === "google"}
              disabled={isBusy}
              onPress={handleGoogle}
              style={[
                styles.socialButton,
                {
                  backgroundColor: AUTH_SCREEN_PALETTE.socialBg,
                  borderColor: AUTH_SCREEN_PALETTE.socialBorder,
                },
              ]}
            >
              <Ionicons color={AUTH_SCREEN_PALETTE.socialText} name="logo-google" size={16} />
              <Text
                text="Continue with Google"
                size="xs"
                weight="medium"
                style={{ color: AUTH_SCREEN_PALETTE.socialText }}
              />
            </SignInButton>

            <AuthError message={error} />
          </View>
        </MotionView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomContent: {
    gap: 24,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGroup: {
    gap: 12,
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
  emailButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    height: 56,
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
  },
  heroSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  landingMain: {
    flex: 1,
  },
  logo: {
    height: 96,
    width: 96,
  },
  screen: {
    flex: 1,
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
  subtitle: {
    maxWidth: 300,
    textAlign: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
})
