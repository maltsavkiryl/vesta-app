import type { ReactNode } from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"

export type GlyphBoxTone = "neutral" | "accent" | "success" | "warning" | "danger"

export interface GlyphBoxProps {
  /**
   * The icon or element to display inside.
   */
  children: ReactNode
  /**
   * The semantic tone for the background and optional border.
   */
  tone?: GlyphBoxTone
  /**
   * Optional size variant.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Optional container style overrides.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * A standard container for icons with a themed "soft" background.
 */
export function GlyphBox({ children, tone = "neutral", size = "md", style }: GlyphBoxProps) {
  const tokens = useDesignTokens()

  const backgroundColor = {
    accent: tokens.accentSoft,
    danger: tokens.dangerSoft,
    neutral: tokens.surfaceSecondary,
    success: tokens.successSoft,
    warning: tokens.warningSoft,
  }[tone]

  return (
    <View style={[styles.container, sizeStyles[size], { backgroundColor }, style]}>{children}</View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
})

const sizeStyles: Record<NonNullable<GlyphBoxProps["size"]>, ViewStyle> = {
  lg: {
    borderRadius: 16,
    height: 48,
    width: 48,
  },
  md: {
    borderRadius: 12,
    height: 36,
    width: 36,
  },
  sm: {
    borderRadius: 10,
    height: 32,
    width: 32,
  },
}
