/* eslint-disable react-native/no-inline-styles */

import { ReactNode } from "react"
import { StyleSheet, TextInput, TextInputProps, View } from "react-native"

import { Text } from "@/components/Text"
import { useDesignTokens } from "@/design-system/tokens"

interface AuthTextFieldProps extends TextInputProps {
  label: string
  rightAccessory?: ReactNode
}

export function AuthTextField({ label, rightAccessory, style, ...props }: AuthTextFieldProps) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: tokens.background,
          borderColor: tokens.border,
        },
      ]}
    >
      <Text
        text={label.toUpperCase()}
        size="xxs"
        weight="medium"
        style={{ color: tokens.textMuted }}
      />
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          autoCorrect={false}
          placeholderTextColor={tokens.textMuted}
          selectionColor={tokens.accent}
          {...props}
          style={[styles.input, { color: tokens.textPrimary }, style]}
        />
        {rightAccessory}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 26,
    padding: 0,
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})
