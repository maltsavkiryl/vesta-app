import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import { Text, useDesignTokens } from "@/ui"

import { AuthFormLayout, AUTH_SCREEN_PALETTE } from "./AuthFormLayout"
import { AuthError } from "./AuthScaffold"
import { useSelectEmployerScreen } from "./useSelectEmployerScreen"

export function SelectEmployerScreen() {
  const tokens = useDesignTokens()
  const { employers, error, handleBackToSignIn, handleSelect, selectingCode } =
    useSelectEmployerScreen()

  return (
    <AuthFormLayout
      onBack={handleBackToSignIn}
      subtitle={translate("auth:selectEmployer.subtitle")}
      title={translate("auth:selectEmployer.title")}
    >
      <View style={styles.list}>
        {employers.length === 0 ? (
          <Text
            size="xs"
            style={{ color: AUTH_SCREEN_PALETTE.panelMuted }}
            text={translate("auth:selectEmployer.empty")}
          />
        ) : (
          employers.map((employer) => {
            const isSelecting = selectingCode === employer.uniqueCode
            const isDisabled = selectingCode !== null
            return (
              <Pressable
                accessibilityLabel={employer.name}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled, busy: isSelecting }}
                disabled={isDisabled}
                key={employer.uniqueCode}
                onPress={() => handleSelect(employer.uniqueCode)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: AUTH_SCREEN_PALETTE.fieldBackground,
                    borderColor: AUTH_SCREEN_PALETTE.fieldBorder,
                    opacity: pressed || (isDisabled && !isSelecting) ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.rowLabel, { color: AUTH_SCREEN_PALETTE.fieldText }]}
                  text={employer.name}
                  weight="medium"
                />
                {isSelecting ? (
                  <ActivityIndicator color={tokens.accent} size="small" />
                ) : (
                  <Ionicons
                    color={AUTH_SCREEN_PALETTE.panelMuted}
                    name="chevron-forward"
                    size={18}
                  />
                )}
              </Pressable>
            )
          })
        )}

        <AuthError message={error} />
      </View>
    </AuthFormLayout>
  )
}

const styles = StyleSheet.create({
  list: {
    alignItems: "stretch",
    gap: 12,
  },
  row: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  rowLabel: {
    flex: 1,
  },
})
