import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { Button, Text } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { AuthAccessoryButton } from "./AuthAccessoryButton"
import { AuthFormLayout, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthError } from "./AuthScaffold"
import { AuthTextField } from "./AuthTextField"

export function ForgotPasswordScreen() {
  const router = useRouter()
  const { requestPasswordReset, resetPassword } = useAuthActions()
  const [email, setEmail] = useState("")
  const [nextPassword, setNextPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"verify" | "reset" | "done">("verify")
  const [error, setError] = useState<string>()
  const [showPassword, setShowPassword] = useState(false)

  const clearError = () => {
    if (error) setError(undefined)
  }

  const sharedFieldStyle = [
    {
      backgroundColor: AUTH_SCREEN_PALETTE.fieldBackground,
      borderColor: AUTH_SCREEN_PALETTE.fieldBorder,
    },
  ]

  const handleVerify = async () => {
    if (!email.includes("@")) {
      fireHaptic("warning")
      setError("Enter your email to continue.")
      return
    }
    setError(undefined)
    const result = await requestPasswordReset(email)
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }
    fireHaptic("success")
    setStep("reset")
  }

  const handleReset = async () => {
    if (nextPassword.length < 6) {
      fireHaptic("warning")
      setError("Use a password with at least 6 characters.")
      return
    }

    if (nextPassword !== confirmPassword) {
      fireHaptic("warning")
      setError("The new passwords do not match.")
      return
    }

    setError(undefined)
    const result = await resetPassword({ email, nextPassword })
    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }

    fireHaptic("success")
    setStep("done")
  }

  return (
    <AuthFormLayout
      onBack={() => router.replace("/(auth)/sign-in")}
      title={
        step === "verify"
          ? "Reset password"
          : step === "reset"
            ? "Create a new password"
            : "Password updated"
      }
      subtitle={
        step === "verify"
          ? "Confirm your email to continue."
          : step === "reset"
            ? "Set a new password for your account."
            : "You can now sign in with this account."
      }
    >
      {step === "done" ? (
        <View style={styles.successState}>
          <View style={styles.successBadge}>
            <Ionicons color={AUTH_SCREEN_PALETTE.panelText} name="checkmark" size={20} />
          </View>
          <View style={styles.successTextBlock}>
            <Text
              text={email}
              size="xs"
              weight="semiBold"
              style={[styles.centerText, { color: AUTH_SCREEN_PALETTE.panelText }]}
            />
            <Text
              text="Use your new password the next time you sign in."
              size="xxs"
              style={[styles.centerText, { color: AUTH_SCREEN_PALETTE.panelMuted }]}
            />
          </View>
          <Button
            fullWidth
            label="Back to sign in"
            onPress={() => router.replace("/(auth)/sign-in")}
            pressHaptic="none"
          />
        </View>
      ) : (
        <View style={styles.form}>
          <AuthError message={error} />
          <AuthTextField
            autoCapitalize="none"
            autoComplete="email"
            containerStyle={sharedFieldStyle}
            keyboardType="email-address"
            label="Email"
            labelCase="default"
            onChangeText={(value) => {
              setEmail(value)
              clearError()
            }}
            placeholder="Email"
            placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
            returnKeyType={step === "verify" ? "done" : "next"}
            showLabel={false}
            style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
            textContentType="username"
            value={email}
            onSubmitEditing={step === "verify" ? handleVerify : undefined}
            rightAccessory={
              email.length > 0 ? (
                <AuthAccessoryButton
                  accessibilityLabel="Clear email"
                  icon="close"
                  onPress={() => {
                    setEmail("")
                    clearError()
                  }}
                  style={[styles.clearButton, { backgroundColor: AUTH_SCREEN_PALETTE.clearButton }]}
                />
              ) : null
            }
          />
          {step === "reset" ? (
            <>
              <AuthTextField
                autoCapitalize="none"
                autoComplete="new-password"
                containerStyle={sharedFieldStyle}
                label="New password"
                labelCase="default"
                onChangeText={(value) => {
                  setNextPassword(value)
                  clearError()
                }}
                placeholder="New password"
                placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
                returnKeyType="next"
                secureTextEntry={!showPassword}
                showLabel={false}
                style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
                textContentType="newPassword"
                value={nextPassword}
                rightAccessory={
                  <AuthAccessoryButton
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowPassword((current) => !current)}
                    style={[
                      styles.clearButton,
                      { backgroundColor: AUTH_SCREEN_PALETTE.clearButton },
                    ]}
                  />
                }
              />
              <AuthTextField
                autoCapitalize="none"
                autoComplete="new-password"
                containerStyle={sharedFieldStyle}
                label="Confirm password"
                labelCase="default"
                onChangeText={(value) => {
                  setConfirmPassword(value)
                  clearError()
                }}
                placeholder="Confirm password"
                placeholderTextColor={AUTH_SCREEN_PALETTE.fieldPlaceholder}
                returnKeyType="done"
                secureTextEntry={!showPassword}
                showLabel={false}
                style={{ color: AUTH_SCREEN_PALETTE.fieldText }}
                textContentType="password"
                value={confirmPassword}
                onSubmitEditing={handleReset}
              />
            </>
          ) : null}
          <Button
            fullWidth
            label={step === "verify" ? "Continue" : "Save new password"}
            onPress={step === "verify" ? handleVerify : handleReset}
            pressHaptic="none"
          />
          <Button
            fullWidth
            label="Back to sign in"
            onPress={() => router.replace("/(auth)/sign-in")}
            variant="secondary"
          />
        </View>
      )}
    </AuthFormLayout>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
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
  successBadge: {
    alignItems: "center",
    backgroundColor: AUTH_SCREEN_PALETTE.badgeTint,
    borderColor: AUTH_SCREEN_PALETTE.panelBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  successState: {
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
  successTextBlock: {
    gap: 6,
  },
})
