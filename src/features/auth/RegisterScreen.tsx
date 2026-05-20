import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, MotionView, Text, appTypography, useDesignTokens } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthError } from "./AuthScaffold"
import { AuthLogo } from "./AuthLogo"
import { AuthTextField } from "./AuthTextField"
import { useRegisterScreen } from "./useRegisterScreen"

export function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const {
    confirmPassword,
    email,
    error,
    firstName,
    handleSubmit,
    lastName,
    password,
    router,
    setConfirmPassword,
    setEmail,
    setFirstName,
    setLastName,
    setPassword,
    showPassword,
    toggleShowPassword,
  } = useRegisterScreen()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: tokens.backgroundMuted }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
            paddingTop: insets.top + 30,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotionView style={styles.header}>
          <AuthLogo style={styles.logo} />
          <Text
            text="Create account"
            weight="bold"
            style={[appTypography.authTitle, styles.centerText, { color: tokens.textPrimary }]}
          />
          <Text
            text="Add your details to continue."
            style={[
              appTypography.authSubtitle,
              styles.subtitle,
              styles.centerText,
              { color: tokens.textSecondary },
            ]}
          />
        </MotionView>

        <MotionView delay={70} style={styles.form}>
          <View style={styles.nameRow}>
            <AuthTextField
              accessibilityLabel="First name"
              autoCapitalize="words"
              autoComplete="given-name"
              containerStyle={styles.nameField}
              onChangeText={setFirstName}
              label="First name"
              labelCase="default"
              placeholder="First name"
              returnKeyType="next"
              showLabel={false}
              textContentType="givenName"
              value={firstName}
            />
            <AuthTextField
              accessibilityLabel="Last name"
              autoCapitalize="words"
              autoComplete="family-name"
              containerStyle={styles.nameField}
              onChangeText={setLastName}
              label="Last name"
              labelCase="default"
              placeholder="Last name"
              returnKeyType="next"
              showLabel={false}
              textContentType="familyName"
              value={lastName}
            />
          </View>

          <AuthTextField
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            labelCase="default"
            onChangeText={setEmail}
            placeholder="Email"
            returnKeyType="next"
            showLabel={false}
            textContentType="username"
            value={email}
          />

          <AuthTextField
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="Password"
            labelCase="default"
            onChangeText={setPassword}
            placeholder="Password"
            returnKeyType="next"
            secureTextEntry={!showPassword}
            showLabel={false}
            textContentType="newPassword"
            value={password}
            rightAccessory={
              <AuthAccessoryButton
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                icon={showPassword ? "eye-off-outline" : "eye-outline"}
                onPress={toggleShowPassword}
              />
            }
          />

          <AuthTextField
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="Confirm password"
            labelCase="default"
            onChangeText={setConfirmPassword}
            onSubmitEditing={handleSubmit}
            placeholder="Confirm password"
            returnKeyType="done"
            secureTextEntry={!showPassword}
            showLabel={false}
            textContentType="newPassword"
            value={confirmPassword}
          />

          <AuthError message={error} />

          <Button fullWidth label="Create account" onPress={handleSubmit} pressHaptic="none" />
          <Button
            fullWidth
            label="Sign in instead"
            onPress={() => router.replace("/(auth)/sign-in")}
            variant="secondary"
          />
        </MotionView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  form: {
    gap: 9,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    height: 76,
    marginBottom: 18,
    width: 76,
  },
  nameField: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 9,
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    marginTop: 6,
  },
})
