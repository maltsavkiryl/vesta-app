import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Banner, Button, MotionView, Text, appTypography, useDesignTokens } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
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
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
            paddingTop: insets.top + 30,
          },
        ]}
      >
        <MotionView style={styles.header}>
          <AuthLogo style={styles.logo} />
          <Text
            text="Sign in"
            weight="bold"
            style={[appTypography.authTitle, { color: tokens.textPrimary }]}
          />
          <Text
            text="Use your Vesta account to open planning, time, and payroll."
            size="xs"
            style={[styles.headerSubtitle, { color: tokens.textSecondary }]}
          />
        </MotionView>

        <MotionView delay={70} style={styles.form}>
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

          {error ? (
            <Banner tone="danger">
              <Text text={error} size="xxs" />
            </Banner>
          ) : null}

          <Button fullWidth label="Continue" onPress={handleContinue} pressHaptic="none" />
          <Button
            fullWidth
            label="Register"
            onPress={() => router.replace("/(auth)/register")}
            variant="secondary"
          />
          <Text
            text="Google and Apple sign-in are not set up in this build."
            size="xxs"
            style={[styles.footerNote, { color: tokens.textMuted }]}
          />
        </MotionView>
      </View>
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
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  footerNote: {
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
  headerSubtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  logo: {
    height: 53,
    marginBottom: 18,
    width: 53,
  },
  screen: {
    flex: 1,
  },
})
