import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppScrollScreen, Text, appTypography, useDesignTokens } from "@/ui"

export interface OnboardingWelcomeProps {
  firstName: string
  onStart: () => void
  onSkip: () => void
}

export function OnboardingWelcome({ firstName, onStart, onSkip }: OnboardingWelcomeProps) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.welcomeScreen, { paddingBottom: insets.bottom + 40 }]}
    >
      <View style={styles.welcomeArt}>
        <View style={[styles.welcomeHaloOuter, { backgroundColor: tokens.accentSoft }]} />
        <View style={[styles.welcomeHaloInner, { backgroundColor: tokens.accentSoft }]} />
        <View style={[styles.welcomeMark, { backgroundColor: tokens.textPrimary }]}>
          <Text
            text="V"
            weight="bold"
            style={[styles.welcomeLetter, { color: tokens.background }]}
          />
        </View>
      </View>
      <View style={styles.welcomeCopy}>
        <Text
          text={`Welcome to Vesta,\n${firstName}.`}
          weight="bold"
          style={[appTypography.onboardingHeroTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text="Let's get your account set up in just a few steps. It'll only take 2 minutes."
          size="sm"
          style={{ color: tokens.textSecondary }}
        />
        <Pressable
          onPress={onStart}
          style={[styles.darkButton, { backgroundColor: tokens.textPrimary }]}
        >
          <Text
            text="Get started"
            size="sm"
            weight="semiBold"
            style={{ color: tokens.background }}
          />
          <Ionicons color={tokens.background} name="arrow-forward-outline" size={18} />
        </Pressable>
        <Pressable onPress={onSkip} style={styles.skipButton}>
          <Text text="Skip for now" size="xxs" style={{ color: tokens.textMuted }} />
        </Pressable>
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  darkButton: {
    alignItems: "center",
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
