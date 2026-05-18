import { ReactNode } from "react"
import { StyleProp, TextInputProps, ViewStyle } from "react-native"

import { TextField } from "@/ui"
import type { Tone } from "@/ui/foundations/variants"

interface AuthTextFieldProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>
  label: string
  labelCase?: "default" | "uppercase"
  tone?: Tone
  rightAccessory?: ReactNode
  variant?: "default" | "muted" | "outline"
}

export function AuthTextField({
  containerStyle,
  label,
  labelCase,
  rightAccessory,
  style,
  tone,
  variant = "muted",
  ...props
}: AuthTextFieldProps) {
  return (
    <TextField
      accessibilityLabel={label}
      autoCorrect={false}
      containerStyle={containerStyle}
      inputStyle={style}
      label={label}
      labelCase={labelCase}
      rightAccessory={rightAccessory}
      tone={tone}
      variant={variant}
      {...props}
    />
  )
}
