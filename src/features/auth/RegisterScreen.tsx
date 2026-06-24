import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { Button } from "@/ui"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthFormLayout, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthError } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"
import { useRegisterScreen } from "./useRegisterScreen"

export function RegisterScreen() {
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

  const sharedFieldStyle = [
    {
      backgroundColor: AUTH_SCREEN_PALETTE.fieldBackground,
      borderColor: AUTH_SCREEN_PALETTE.fieldBorder,
    },
  ]

  return (
    <AuthFormLayout
      onBack={() => router.replace("/(auth)/sign-in")}
      subtitle={translate("auth:registerSubtitle")}
      title={translate("auth:createAccount")}
    >
      <View style={styles.form}>
        <View style={styles.nameRow}>
          <AuthTextField
            accessibilityLabel={translate("auth:fields.firstName")}
            autoCapitalize="words"
            autoComplete="given-name"
            containerStyle={[sharedFieldStyle, styles.nameField]}
            onChangeText={setFirstName}
            label={translate("auth:fields.firstName")}
            labelCase="default"
            placeholder={translate("auth:fields.firstName")}
            placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
            returnKeyType="next"
            showLabel={false}
            style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
            textContentType="givenName"
            value={firstName}
          />
          <AuthTextField
            accessibilityLabel={translate("auth:fields.lastName")}
            autoCapitalize="words"
            autoComplete="family-name"
            containerStyle={[sharedFieldStyle, styles.nameField]}
            onChangeText={setLastName}
            label={translate("auth:fields.lastName")}
            labelCase="default"
            placeholder={translate("auth:fields.lastName")}
            placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
            returnKeyType="next"
            showLabel={false}
            style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
            textContentType="familyName"
            value={lastName}
          />
        </View>

        <AuthTextField
          accessibilityLabel={translate("auth:fields.email")}
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={sharedFieldStyle}
          keyboardType="email-address"
          label={translate("auth:fields.email")}
          labelCase="default"
          onChangeText={setEmail}
          placeholder={translate("auth:fields.email")}
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="next"
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="username"
          value={email}
        />

        <AuthTextField
          accessibilityLabel={translate("auth:fields.password")}
          autoCapitalize="none"
          autoComplete="new-password"
          containerStyle={sharedFieldStyle}
          label={translate("auth:fields.password")}
          labelCase="default"
          onChangeText={setPassword}
          placeholder={translate("auth:fields.password")}
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="next"
          secureTextEntry={!showPassword}
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="newPassword"
          value={password}
          rightAccessory={
            <AuthAccessoryButton
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              onPress={toggleShowPassword}
              style={[styles.clearButton, { backgroundColor: AUTH_SCREEN_PALETTE.clearButton }]}
            />
          }
        />

        <AuthTextField
          accessibilityLabel={translate("auth:fields.confirmPassword")}
          autoCapitalize="none"
          containerStyle={sharedFieldStyle}
          label={translate("auth:fields.confirmPassword")}
          labelCase="default"
          onChangeText={setConfirmPassword}
          onSubmitEditing={handleSubmit}
          placeholder={translate("auth:fields.confirmPassword")}
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="done"
          secureTextEntry={!showPassword}
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="password"
          value={confirmPassword}
        />

        <AuthError message={error} />

        <Button
          fullWidth
          label={translate("auth:createAccount")}
          onPress={handleSubmit}
          pressHaptic="none"
        />
        <Button
          fullWidth
          label={translate("auth:signInInstead")}
          onPress={() => router.replace("/(auth)/sign-in")}
          variant="secondary"
        />
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
  form: {
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 9,
  },
})
