import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { MotionView, Text } from "@/ui"

import { AuthBackgroundLayers, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthLogo } from "./AuthLogo"

export function SignInScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

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
            <Pressable
              onPress={() => router.push("/(auth)/sign-in-email")}
              style={({ pressed }) => [
                styles.emailButton,
                {
                  backgroundColor: AUTH_SCREEN_PALETTE.emailButtonBg,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Text
                text="Log in with email"
                size="xs"
                weight="semiBold"
                style={{ color: AUTH_SCREEN_PALETTE.emailButtonText }}
              />
            </Pressable>

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

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: AUTH_SCREEN_PALETTE.socialBg,
                  borderColor: AUTH_SCREEN_PALETTE.socialBorder,
                  opacity: pressed ? 0.88 : 1,
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
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: AUTH_SCREEN_PALETTE.socialBg,
                  borderColor: AUTH_SCREEN_PALETTE.socialBorder,
                  opacity: pressed ? 0.88 : 1,
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
            </Pressable>
          </View>
        </MotionView>
      </View>
    </View>
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
