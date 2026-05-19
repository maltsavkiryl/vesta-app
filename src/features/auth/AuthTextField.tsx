import { ReactNode } from "react"
import { StyleProp, TextInputProps, ViewStyle } from "react-native"

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
  return (
    <TextField
      accessibilityLabel={props.accessibilityLabel ?? label}
      autoCorrect={false}
      containerStyle={containerStyle}
      inputStyle={style}
      label={showLabel ? label : undefined}
      labelCase={labelCase}
      rightAccessory={rightAccessory}
      tone={tone}
      variant={variant}
      {...props}
    />
  )
}
