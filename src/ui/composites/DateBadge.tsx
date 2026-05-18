import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

type DateBadgeVariant = "muted" | "plain" | "surfaceSecondary"

const variantBackground = {
  muted: "backgroundMuted",
  plain: "transparent",
  surfaceSecondary: "surfaceSecondary",
} as const

export function DateBadge({
  label,
  value,
  variant = "muted",
  style,
}: {
  label: string
  value: string
  variant?: DateBadgeVariant
  style?: StyleProp<ViewStyle>
}) {
  const tokens = useDesignTokens()
  const backgroundKey = variantBackground[variant]
  const backgroundColor =
    backgroundKey === "transparent" ? tokens.transparent : tokens[backgroundKey]

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text text={label} size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
      <Text text={value} size="sm" weight="semiBold" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    gap: 1,
    height: 50,
    justifyContent: "center",
    width: 44,
  },
})
