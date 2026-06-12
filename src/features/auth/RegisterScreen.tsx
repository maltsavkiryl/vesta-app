import { StyleSheet, View } from "react-native"

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
      subtitle="Add your details to continue."
      title="Create account"
    >
      <View style={styles.form}>
        <View style={styles.nameRow}>
          <AuthTextField
            accessibilityLabel="First name"
            autoCapitalize="words"
            autoComplete="given-name"
            containerStyle={[sharedFieldStyle, styles.nameField]}
            onChangeText={setFirstName}
            label="First name"
            labelCase="default"
            placeholder="First name"
            placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
            returnKeyType="next"
            showLabel={false}
            style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
            textContentType="givenName"
            value={firstName}
          />
          <AuthTextField
            accessibilityLabel="Last name"
            autoCapitalize="words"
            autoComplete="family-name"
            containerStyle={[sharedFieldStyle, styles.nameField]}
            onChangeText={setLastName}
            label="Last name"
            labelCase="default"
            placeholder="Last name"
            placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
            returnKeyType="next"
            showLabel={false}
            style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
            textContentType="familyName"
            value={lastName}
          />
        </View>

        <AuthTextField
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={sharedFieldStyle}
          keyboardType="email-address"
          label="Email"
          labelCase="default"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="next"
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="username"
          value={email}
        />

        <AuthTextField
          accessibilityLabel="Password"
          autoCapitalize="none"
          autoComplete="new-password"
          containerStyle={sharedFieldStyle}
          label="Password"
          labelCase="default"
          onChangeText={setPassword}
          placeholder="Password"
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
          accessibilityLabel="Confirm password"
          autoCapitalize="none"
          containerStyle={sharedFieldStyle}
          label="Confirm password"
          labelCase="default"
          onChangeText={setConfirmPassword}
          onSubmitEditing={handleSubmit}
          placeholder="Confirm password"
          placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
          returnKeyType="done"
          secureTextEntry={!showPassword}
          showLabel={false}
          style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
          textContentType="password"
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
