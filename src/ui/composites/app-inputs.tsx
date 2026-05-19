import { ReactNode } from "react"
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"

export function SearchField({
  inputStyle,
  leftAccessory,
  onChangeText,
  onClear,
  placeholder = "Search",
  rightAccessory,
  style,
  value,
  ...props
}: Omit<TextInputProps, "style"> & {
  inputStyle?: TextInputProps["style"]
  leftAccessory?: ReactNode
  onClear?: () => void
  rightAccessory?: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.searchField, { backgroundColor: tokens.surface }, style]}>
      {leftAccessory}
      <TextInput
        {...props}
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.textMuted}
        selectionColor={tokens.accent}
        style={[styles.searchFieldInput, { color: tokens.textPrimary }, inputStyle]}
        value={value}
      />
      {value && onClear ? (
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onClear}>
          {rightAccessory}
        </Pressable>
      ) : onClear ? null : (
        rightAccessory
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  searchField: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  searchFieldInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 20,
    padding: 0,
  },
})
