import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, MotionView, Text, appTypography, useDesignTokens } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthError } from "./AuthScaffold"
import { AuthLogo } from "./AuthLogo"
import { AuthTextField } from "./AuthTextField"
import { useSignInScreen } from "./useSignInScreen"

export function SignInScreen() {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: tokens.backgroundMuted }]}
    >
      <ScrollView
        style={[
          styles.screen,
          { backgroundColor: tokens.backgroundMuted },
        ]}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 24),
            paddingTop: insets.top + 18,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotionView style={styles.heroWrap}>
          <LinearGradient
            colors={
              tokens.isDark
                ? [tokens.heroStart, tokens.heroEnd]
                : [tokens.surface, tokens.heroStart]
            }
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[
              styles.heroCard,
              {
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
                shadowColor: tokens.shadow,
              },
            ]}
          >
            <View
              style={[
                styles.heroGlowLarge,
                { backgroundColor: tokens.isDark ? `${tokens.accent}1A` : `${tokens.accent}12` },
              ]}
            />
            <View
              style={[
                styles.heroGlowSmall,
                {
                  backgroundColor: tokens.isDark
                    ? `${tokens.surfaceSecondary}B8`
                    : `${tokens.surface}CC`,
                  borderColor: tokens.border,
                },
              ]}
            />

            <View
              style={[
                styles.logoShell,
                {
                  backgroundColor: tokens.isDark ? tokens.surfaceSecondary : tokens.surface,
                  borderColor: `${tokens.accent}18`,
                  shadowColor: tokens.shadow,
                },
              ]}
            >
              <View style={[styles.logoHalo, { backgroundColor: tokens.accentSoft }]}>
                <AuthLogo style={styles.logo} />
              </View>
            </View>

            <View style={styles.header}>
              <Text
                text="Planning, time, and payroll"
                size="xxs"
                weight="semiBold"
                style={[styles.eyebrow, { color: tokens.textSecondary }]}
              />
              <Text
                text="Sign in"
                weight="bold"
                style={[appTypography.authTitle, { color: tokens.textPrimary }]}
              />
              <Text
                text="Use your Vesta account to open your shifts, hours, and payslips in one place."
                size="xs"
                style={[styles.headerSubtitle, { color: tokens.textSecondary }]}
              />
              <View style={styles.badgeRow}>
                {["Planning", "Time", "Payroll"].map((label) => (
                  <View
                    key={label}
                    style={[
                      styles.badge,
                      {
                        backgroundColor: tokens.isDark ? tokens.surfaceSecondary : tokens.surface,
                        borderColor: `${tokens.accent}14`,
                      },
                    ]}
                  >
                    <Text
                      text={label}
                      size="xxs"
                      weight="medium"
                      style={{ color: tokens.textPrimary }}
                    />
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </MotionView>

        <MotionView
          delay={70}
          style={[
            styles.formCard,
            {
              backgroundColor: tokens.surfaceElevated,
              borderColor: tokens.border,
              shadowColor: tokens.shadow,
            },
          ]}
        >
          <View style={styles.formHeader}>
            <Text text="Welcome back" size="sm" weight="semiBold" style={{ color: tokens.textPrimary }} />
            <Text
              text="Sign in to continue."
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>

          <View style={styles.form}>
            <AuthTextField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              labelCase="default"
              onChangeText={handleEmailChange}
              onSubmitEditing={handleContinue}
              placeholder="Email"
              returnKeyType="next"
              showLabel={false}
              textContentType="username"
              value={email}
              rightAccessory={
                email.length > 0 ? (
                  <AuthAccessoryButton
                    accessibilityLabel="Clear email"
                    icon="close"
                    onPress={clearEmail}
                    style={[styles.clearButton, { backgroundColor: tokens.textMuted }]}
                  />
                ) : null
              }
            />

            <AuthTextField
              autoCapitalize="none"
              autoComplete="off"
              label="Password"
              labelCase="default"
              onChangeText={handlePasswordChange}
              onSubmitEditing={handleContinue}
              placeholder="Password"
              returnKeyType="done"
              secureTextEntry
              showLabel={false}
              textContentType="password"
              value={password}
              rightAccessory={
                password.length > 0 ? (
                  <AuthAccessoryButton
                    accessibilityLabel="Clear password"
                    icon="close"
                    onPress={clearPassword}
                    style={[styles.clearButton, { backgroundColor: tokens.textMuted }]}
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

            <Button fullWidth label="Continue" onPress={handleContinue} pressHaptic="none" />
          </View>

          <View style={[styles.divider, { backgroundColor: tokens.border }]} />

          <View style={styles.footerRow}>
            <Text text="New to Vesta?" size="xxs" style={{ color: tokens.textSecondary }} />
            <Pressable hitSlop={8} onPress={() => router.replace("/(auth)/register")}>
              <Text text="Register" size="xxs" weight="semiBold" style={{ color: tokens.accent }} />
            </Pressable>
          </View>
        </MotionView>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 18,
  },
  eyebrow: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  badge: {
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingTop: 16,
  },
  form: {
    alignItems: "stretch",
    gap: 10,
  },
  formCard: {
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: -14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 18,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: Platform.select({ android: 0, default: 0.08 }),
    shadowRadius: 28,
  },
  formHeader: {
    gap: 2,
    marginBottom: 14,
  },
  header: {
    gap: 8,
  },
  headerSubtitle: {
    maxWidth: 260,
  },
  heroCard: {
    borderCurve: "continuous",
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 272,
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingVertical: 22,
    shadowOffset: { height: 18, width: 0 },
    shadowOpacity: Platform.select({ android: 0, default: 0.08 }),
    shadowRadius: 30,
  },
  heroGlowLarge: {
    borderRadius: 120,
    height: 220,
    position: "absolute",
    right: -50,
    top: -36,
    width: 220,
  },
  heroGlowSmall: {
    borderCurve: "continuous",
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    height: 120,
    position: "absolute",
    right: 20,
    top: 44,
    transform: [{ rotate: "14deg" }],
    width: 112,
  },
  heroWrap: {
    marginBottom: 10,
  },
  inlineLinkRow: {
    alignItems: "flex-end",
  },
  logo: {
    height: 48,
    width: 48,
  },
  logoHalo: {
    alignItems: "center",
    borderRadius: 22,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  logoShell: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 26,
    padding: 10,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: Platform.select({ android: 0, default: 0.06 }),
    shadowRadius: 22,
  },
  screen: {
    flex: 1,
  },
})
