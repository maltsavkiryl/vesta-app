import type { ReactNode } from "react"
import { StyleSheet, View, type ViewStyle, type StyleProp } from "react-native"
import { useDesignTokens } from "@/ui/foundations/theme"

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
    <View style={[styles.container, styles[size], { backgroundColor }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  sm: {
    borderRadius: 10,
    height: 32,
    width: 32,
  },
  md: {
    borderRadius: 12,
    height: 36,
    width: 36,
  },
  lg: {
    borderRadius: 16,
    height: 48,
    width: 48,
  },
})
