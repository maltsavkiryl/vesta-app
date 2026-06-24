import { ActivityIndicator, StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { Button, useDesignTokens } from "@/ui"

import { AuthFormLayout } from "./AuthFormLayout"
import { AuthError } from "./AuthScaffold"
import { useAcceptInvitationScreen } from "./useAcceptInvitationScreen"

export function AcceptInvitationScreen() {
  const tokens = useDesignTokens()
  const { status, error, handleBackToSignIn } = useAcceptInvitationScreen()
  const isWorking = status === "working"

  return (
    <AuthFormLayout
      onBack={handleBackToSignIn}
      subtitle={
        isWorking
          ? translate("auth:acceptInvitation.connecting")
          : translate("auth:acceptInvitation.failed")
      }
      title={
        isWorking
          ? translate("auth:acceptInvitation.joiningTitle")
          : translate("auth:acceptInvitation.problemTitle")
      }
    >
      <View style={styles.body}>
        {isWorking ? (
          <ActivityIndicator color={tokens.accent} size="large" />
        ) : (
          <>
            <AuthError message={error} />
            <Button fullWidth label={translate("auth:backToSignIn")} onPress={handleBackToSignIn} />
          </>
        )}
      </View>
    </AuthFormLayout>
  )
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
})
