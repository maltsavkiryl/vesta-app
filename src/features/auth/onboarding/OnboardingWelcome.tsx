import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { translate } from "@/i18n/translate"
import { AppScrollScreen, MotionView, Text, appTypography, useDesignTokens } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"

export interface OnboardingWelcomeProps {
  firstName: string
  onStart: () => void
  onSkip: () => void
}

export function OnboardingWelcome({ firstName, onStart, onSkip }: OnboardingWelcomeProps) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { animatedStyle: startAnim, pressHandlers: startHandlers } = usePressScale({
    pressedScale: 0.97,
  })
  const { animatedStyle: skipAnim, pressHandlers: skipHandlers } = usePressScale({})

  const trimmedName = firstName.trim()
  const title = trimmedName
    ? translate("onboarding:welcome.titleNamed", { name: trimmedName })
    : translate("onboarding:welcome.title")
  const getStartedLabel = translate("onboarding:welcome.getStarted")
  const skipLabel = translate("onboarding:welcome.skip")

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.welcomeScreen, { paddingBottom: insets.bottom + 40 }]}
    >
      <MotionView style={styles.welcomeArt}>
        <View style={[styles.welcomeHaloOuter, { backgroundColor: tokens.accentSoft }]} />
        <View style={[styles.welcomeHaloInner, { backgroundColor: tokens.accentSoft }]} />
        <View style={[styles.welcomeMark, { backgroundColor: tokens.textPrimary }]}>
          <Text
            text="V"
            weight="bold"
            style={[styles.welcomeLetter, { color: tokens.background }]}
          />
        </View>
      </MotionView>
      <MotionView delay={60} style={styles.welcomeCopy}>
        <Text
          text={title}
          weight="bold"
          style={[appTypography.onboardingHeroTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text={translate("onboarding:welcome.subtitle")}
          size="sm"
          style={{ color: tokens.textSecondary }}
        />
        <Animated.View style={startAnim}>
          <Pressable
            accessibilityLabel={getStartedLabel}
            accessibilityRole="button"
            onPress={onStart}
            style={[styles.darkButton, { backgroundColor: tokens.textPrimary }]}
            {...startHandlers}
          >
            <Text
              text={getStartedLabel}
              size="sm"
              weight="semiBold"
              style={{ color: tokens.background }}
            />
            <Ionicons color={tokens.background} name="arrow-forward-outline" size={18} />
          </Pressable>
        </Animated.View>
        <Animated.View style={skipAnim}>
          <Pressable
            accessibilityLabel={skipLabel}
            accessibilityRole="button"
            onPress={onSkip}
            style={styles.skipButton}
            {...skipHandlers}
          >
            <Text text={skipLabel} size="xxs" style={{ color: tokens.textMuted }} />
          </Pressable>
        </Animated.View>
      </MotionView>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  darkButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 16,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  welcomeArt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 260,
  },
  welcomeCopy: {
    gap: 12,
  },
  welcomeHaloInner: {
    borderRadius: 99,
    height: 200,
    opacity: 0.72,
    position: "absolute",
    width: 200,
  },
  welcomeHaloOuter: {
    borderRadius: 120,
    height: 240,
    opacity: 0.5,
    position: "absolute",
    width: 240,
  },
  welcomeLetter: {
    fontSize: 54,
    lineHeight: 62,
  },
  welcomeMark: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 90,
    height: 180,
    justifyContent: "center",
    width: 180,
  },
  welcomeScreen: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
  },
})
