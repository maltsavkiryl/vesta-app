/* eslint-disable react-native/no-inline-styles */

import { ReactNode } from "react"
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { getTonePalette, type Tone } from "@/ui/foundations/variants"
import { Text } from "@/ui/primitives/Text"

export interface TextFieldProps extends TextInputProps {
  caption?: string
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  label?: string
  labelCase?: "default" | "uppercase"
  leftAccessory?: ReactNode
  rightAccessory?: ReactNode
  tone?: Tone
  variant?: "default" | "muted" | "outline"
}

export function TextField({
  caption,
  containerStyle,
  inputStyle,
  label,
  labelCase = "uppercase",
  leftAccessory,
  rightAccessory,
  style,
  tone = "neutral",
  variant = "default",
  ...props
}: TextFieldProps) {
  const tokens = useDesignTokens()
  const normalizedLabel =
    labelCase === "uppercase" && label ? label.toUpperCase() : label
  const tonePalette =
    variant === "outline"
      ? getTonePalette(tokens, tone, "outline")
      : variant === "muted"
        ? {
            backgroundColor: tokens.surfaceSecondary,
            borderColor: tokens.border,
            color: tokens.textPrimary,
          }
        : {
            backgroundColor: tokens.background,
            borderColor: tone === "neutral" ? tokens.border : getTonePalette(tokens, tone, "outline").borderColor,
            color: tokens.textPrimary,
          }

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: tonePalette.backgroundColor,
          borderColor: tonePalette.borderColor,
        },
        containerStyle,
      ]}
    >
      {normalizedLabel ? (
        <Text
          text={normalizedLabel}
          size="xxs"
          weight="medium"
          style={{ color: tokens.textMuted }}
        />
      ) : null}
      <View style={styles.inputRow}>
        {leftAccessory}
        <TextInput
          autoCorrect={false}
          placeholderTextColor={tokens.textMuted}
          selectionColor={tokens.accent}
          {...props}
          style={[styles.input, { color: tokens.textPrimary }, inputStyle, style]}
        />
        {rightAccessory}
      </View>
      {caption ? (
        <Text text={caption} size="xxs" style={{ color: tokens.textSecondary }} />
      ) : null}
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
