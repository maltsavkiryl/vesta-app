import { Pressable, StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { Button, Text, useDesignTokens } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthFormLayout, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthError } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"
import { useSignInScreen } from "./useSignInScreen"

export function SignInEmailScreen() {
  const tokens = useDesignTokens()
  const {
    clearEmail,
    clearPassword,
    email,
    error,
    fillDemoCredentials,
    handleContinue,
    handleEmailChange,
    handlePasswordChange,
    isSubmitting,
    password,
    router,
  } = useSignInScreen()

  return (
    <AuthFormLayout
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
          return
        }

        router.replace("/(auth)/sign-in")
      }}
      subtitle={translate("auth:emailSubtitle")}
      title={translate("auth:loginWithEmail")}
    >
      <View style={styles.form}>
        <AuthTextField
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={styles.field}
          keyboardType="email-address"
          label={translate("auth:fields.email")}
          labelCase="default"
          onChangeText={handleEmailChange}
          onSubmitEditing={handleContinue}
          placeholder={translate("auth:fields.email")}
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="next"
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="username"
          value={email}
          rightAccessory={
            email.length > 0 ? (
              <AuthAccessoryButton
                accessibilityLabel={translate("auth:fields.clearEmail")}
                icon="close"
                onPress={clearEmail}
                style={[styles.clearButton, { backgroundColor: AUTH_SCREEN_PALETTE.clearButton }]}
              />
            ) : null
          }
        />

        <AuthTextField
          autoCapitalize="none"
          autoComplete="off"
          containerStyle={styles.field}
          label={translate("auth:fields.password")}
          labelCase="default"
          onChangeText={handlePasswordChange}
          onSubmitEditing={handleContinue}
          placeholder={translate("auth:fields.password")}
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="done"
          secureTextEntry
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="password"
          value={password}
          rightAccessory={
            password.length > 0 ? (
              <AuthAccessoryButton
                accessibilityLabel={translate("auth:fields.clearPassword")}
                icon="close"
                onPress={clearPassword}
                style={[styles.clearButton, { backgroundColor: AUTH_SCREEN_PALETTE.clearButton }]}
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
            text={translate("auth:forgotPassword")}
            size="xxs"
            weight="medium"
            style={{ color: tokens.accent }}
          />
        </Pressable>

        <AuthError message={error} />

        <Button
          fullWidth
          isLoading={isSubmitting}
          label={translate("auth:loginWithEmail")}
          onPress={handleContinue}
          pressHaptic="none"
        />

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: AUTH_SCREEN_PALETTE.divider }]} />
          <Text
            text={translate("auth:or")}
            size="xxs"
            style={{ color: AUTH_SCREEN_PALETTE.panelMuted }}
          />
          <View style={[styles.dividerLine, { backgroundColor: AUTH_SCREEN_PALETTE.divider }]} />
        </View>

        <Button
          fullWidth
          label={translate("auth:createAccount")}
          onPress={() => router.replace("/(auth)/register")}
          variant="secondary"
        />

        {__DEV__ && fillDemoCredentials ? (
          <Pressable
            accessibilityLabel={translate("auth:fillDemoLabel")}
            accessibilityRole="button"
            hitSlop={8}
            onPress={fillDemoCredentials}
            style={styles.inlineLinkRow}
          >
            <Text
              text={translate("auth:fillDemo")}
              size="xxs"
              weight="medium"
              style={{ color: tokens.accent }}
            />
          </Pressable>
        ) : null}
      </View>
    </AuthFormLayout>
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
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  field: {
    backgroundColor: AUTH_SCREEN_PALETTE.fieldBackground,
    borderColor: AUTH_SCREEN_PALETTE.fieldBorder,
  },
  form: {
    alignItems: "stretch",
    gap: 12,
  },
  inlineLinkRow: {
    alignItems: "flex-end",
  },
})
