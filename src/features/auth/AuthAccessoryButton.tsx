import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { useDesignTokens } from "@/ui"

export function AuthAccessoryButton({
  accessibilityLabel,
  icon,
  onPress,
  style,
}: {
  accessibilityLabel: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  style?: StyleProp<ViewStyle>
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Ionicons color={tokens.textSecondary} name={icon} size={18} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
})
