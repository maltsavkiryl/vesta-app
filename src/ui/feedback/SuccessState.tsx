import type { ReactNode } from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, appTypography, useDesignTokens } from "@/ui"

export interface SuccessStateProps {
  /**
   * Optional icon to display.
   */
  icon?: keyof typeof Ionicons.glyphMap
  /**
   * The primary message to display.
   */
  title: string
  /**
   * Optional secondary message.
   */
  subtitle?: string
  /**
   * Optional tone for the icon. Defaults to success.
   */
  tone?: "success" | "accent" | "warning"
  /**
   * Optional extra content (e.g. stats, buttons).
   */
  children?: ReactNode
  /**
   * Optional container style overrides.
   */
  style?: ViewStyle
}

/**
 * A standard full-screen or section-level success state.
 */
export function SuccessState({
  icon = "checkmark-circle-outline",
  title,
  subtitle,
  children,
  style,
  tone = "success",
}: SuccessStateProps) {
  const tokens = useDesignTokens()

  const backgroundColor =
    tone === "accent"
      ? tokens.accentSoft
      : tone === "warning"
        ? tokens.warningSoft
        : tokens.successSoft
  const iconColor =
    tone === "accent" ? tokens.accent : tone === "warning" ? tokens.warning : tokens.success

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons color={iconColor} name={icon} size={42} />
      </View>
      <View style={styles.textStack}>
        <Text
          text={title}
          weight="bold"
          style={[appTypography.successTitle, styles.title, { color: tokens.textPrimary }]}
        />
        {subtitle ? (
          <Text
            text={subtitle}
            size="xs"
            style={[styles.subtitle, { color: tokens.textSecondary }]}
          />
        ) : null}
      </View>
      {children ? <View style={styles.extra}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  extra: {
    marginTop: 4,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  subtitle: {
    textAlign: "center",
  },
  textStack: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    textAlign: "center",
  },
})
