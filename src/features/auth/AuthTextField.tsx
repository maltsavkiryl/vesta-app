import { ReactNode } from "react"
import { StyleProp, StyleSheet, TextInputProps, ViewStyle } from "react-native"

import { TextField } from "@/ui"
import type { Tone } from "@/ui/foundations/variants"

interface AuthTextFieldProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>
  label: string
  labelCase?: "default" | "uppercase"
  showLabel?: boolean
  tone?: Tone
  rightAccessory?: ReactNode
  variant?: "default" | "muted" | "outline"
}

export function AuthTextField({
  containerStyle,
  label,
  labelCase,
  rightAccessory,
  showLabel = true,
  style,
  tone,
  variant = "muted",
  ...props
}: AuthTextFieldProps) {
  const hasVisibleLabel = showLabel && Boolean(label)

  return (
    <TextField
      accessibilityLabel={props.accessibilityLabel ?? label}
      autoCorrect={false}
      containerStyle={[hasVisibleLabel ? styles.labeledField : styles.bareField, containerStyle]}
      inputStyle={[hasVisibleLabel ? styles.labeledInput : styles.bareInput, style]}
      label={hasVisibleLabel ? label : undefined}
      labelCase={labelCase}
      rightAccessory={rightAccessory}
      tone={tone}
      variant={variant}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  bareField: {
    minHeight: 52,
  },
  bareInput: {
    fontSize: 15,
    lineHeight: 20,
    minHeight: 20,
  },
  labeledField: {
    minHeight: 62,
    paddingVertical: 9,
  },
  labeledInput: {
    fontSize: 15,
    lineHeight: 20,
    minHeight: 22,
  },
})
