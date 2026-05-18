import { ReactNode } from "react"
import { KeyboardTypeOptions, StyleSheet, TextInput, View } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

export function DetailFieldGroup({ children }: { children: ReactNode }) {
  const tokens = useDesignTokens()

  return <View style={[styles.group, { backgroundColor: tokens.surface }]}>{children}</View>
}

export function DetailFieldRow({
  autoCapitalize = "sentences",
  keyboardType = "default",
  label,
  multiline,
  onChangeText,
  placeholder = "Not added",
  value,
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  keyboardType?: KeyboardTypeOptions
  label: string
  multiline?: boolean
  onChangeText: (value: string) => void
  placeholder?: string
  value: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.row, { borderBottomColor: tokens.separator }]}>
      <Text
        text={label}
        numberOfLines={1}
        size="xs"
        style={[styles.label, { color: tokens.textSecondary }]}
      />
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.textMuted}
        selectionColor={tokens.accent}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          { color: tokens.textPrimary },
        ]}
        value={value}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    borderCurve: "continuous",
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 30,
    padding: 0,
  },
  label: {
    flexShrink: 0,
    width: 128,
  },
  multilineInput: {
    minHeight: 86,
    paddingTop: 4,
    textAlignVertical: "top",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
})
