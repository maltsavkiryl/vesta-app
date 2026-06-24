import { PropsWithChildren } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { translate } from "@/i18n/translate"
import { MotionView, Text } from "@/ui"

import { AuthLogo } from "./AuthLogo"

export const AUTH_SCREEN_PALETTE = {
  canvas: "#020408",
  backgroundGradient: ["#020408", "#050919", "#0A1428"] as const,
  backCircleBg: "rgba(255, 255, 255, 0.08)",
  badgeTint: "rgba(60, 110, 220, 0.18)",
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
} as const

export function AuthBackgroundLayers() {
  return (
    <>
      <LinearGradient
        colors={AUTH_SCREEN_PALETTE.backgroundGradient}
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
        start={{ x: 0.4, y: 0.6 }}
        style={styles.gradientOverlay}
      />
      <LinearGradient
        colors={[
          "rgba(100, 140, 220, 0.09)",
          "rgba(100, 140, 220, 0.04)",
          "rgba(100, 140, 220, 0.00)",
        ]}
        end={{ x: 0.3, y: 0.55 }}
        start={{ x: 0, y: 1 }}
        style={styles.gradientOverlay}
      />
    </>
  )
}

export function AuthFormLayout({
  children,
  onBack,
  subtitle,
  title,
}: PropsWithChildren<{
  onBack?: () => void
  subtitle: string
  title: string
}>) {
  const insets = useSafeAreaInsets()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: AUTH_SCREEN_PALETTE.canvas }]}
    >
      <AuthBackgroundLayers />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 24),
            paddingTop: insets.top + 12,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <View>
            {onBack ? (
              <View style={styles.topBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={translate("common:actions.back")}
                  hitSlop={8}
                  onPress={onBack}
                  style={[
                    styles.backButton,
                    {
                      backgroundColor: AUTH_SCREEN_PALETTE.backCircleBg,
                      borderColor: AUTH_SCREEN_PALETTE.panelBorder,
                    },
                  ]}
                >
                  <Ionicons color={AUTH_SCREEN_PALETTE.panelText} name="chevron-back" size={18} />
                </Pressable>
              </View>
            ) : null}

            <MotionView style={styles.heroSection}>
              <AuthLogo style={styles.logo} />
            </MotionView>
          </View>

          <MotionView delay={80} style={styles.bottomContent}>
            <View style={styles.header}>
              <Text
                text={title}
                size="sm"
                weight="semiBold"
                style={{ color: AUTH_SCREEN_PALETTE.panelText }}
              />
              <Text text={subtitle} size="xxs" style={{ color: AUTH_SCREEN_PALETTE.panelMuted }} />
            </View>

            {children}
          </MotionView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  bottomContent: {
    gap: 24,
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  header: {
    gap: 4,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  logo: {
    height: 84,
    width: 84,
  },
  main: {
    flex: 1,
    justifyContent: "space-between",
  },
  screen: {
    flex: 1,
  },
  topBar: {
    minHeight: 52,
    paddingHorizontal: 24,
  },
})
