import { ReactNode } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

export function SelectionCard({
  icon,
  onPress,
  selected,
  style,
  subtitle,
  title,
}: {
  icon?: ReactNode
  onPress: () => void
  selected: boolean
  style?: StyleProp<ViewStyle>
  subtitle?: string
  title: string
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? tokens.accentSoft : tokens.surfaceSecondary,
          borderColor: selected ? tokens.accent : tokens.border,
        },
        style,
      ]}
    >
      {icon}
      <View style={styles.cardCopy}>
        <Text
          text={title}
          size="xxs"
          weight="medium"
          style={[styles.centerText, { color: tokens.textPrimary }]}
        />
        {subtitle ? (
          <Text
            text={subtitle}
            size="xxs"
            style={[styles.centerText, { color: tokens.textSecondary }]}
          />
        ) : null}
      </View>
    </Pressable>
  )
}

export function SelectionChip({
  label,
  onPress,
  selected,
  selectedVariant = "soft",
}: {
  label: string
  onPress: () => void
  selected: boolean
  selectedVariant?: "soft" | "solid"
}) {
  const tokens = useDesignTokens()
  const selectedBackgroundColor = selectedVariant === "solid" ? tokens.accent : tokens.accentSoft
  const textColor = selected
    ? selectedVariant === "solid"
      ? tokens.accentForeground
      : tokens.textPrimary
    : tokens.textPrimary

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? selectedBackgroundColor : tokens.surfaceSecondary,
          borderColor: selected ? tokens.accent : tokens.border,
        },
      ]}
    >
      <Text text={label} size="xxs" weight="medium" style={{ color: textColor }} />
    </Pressable>
  )
}

export function SelectionRow({
  backgroundColor,
  dividerInset = 14,
  grouped = false,
  isLast = false,
  leading,
  onPress,
  selected,
  style,
  subtitle,
  title,
  trailing,
}: {
  backgroundColor?: string
  dividerInset?: number
  grouped?: boolean
  isLast?: boolean
  leading?: ReactNode
  onPress: () => void
  selected: boolean
  style?: StyleProp<ViewStyle>
  subtitle?: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()
  const baseBackgroundColor =
    backgroundColor ?? (selected ? tokens.accentSoft : tokens.surfaceSecondary)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        grouped && styles.groupedRow,
        {
          backgroundColor: pressed ? tokens.pressed : baseBackgroundColor,
          borderColor: selected ? tokens.accent : tokens.border,
        },
        style,
      ]}
    >
      {leading}
      <View style={styles.rowCopy}>
        <Text text={title} size="xs" weight="medium" style={{ color: tokens.textPrimary }} />
        {subtitle ? (
          <Text text={subtitle} size="xxs" style={{ color: tokens.textSecondary }} />
        ) : null}
      </View>
      {trailing}
      {!isLast ? (
        <View
          style={[styles.rowDivider, { backgroundColor: tokens.separator, left: dividerInset }]}
        />
      ) : null}
    </Pressable>
  )
}

export function ToggleSwitch({
  accessibilityLabel,
  onChange,
  value,
}: {
  accessibilityLabel?: string
  onChange: () => void | Promise<void>
  value: boolean
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onChange}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? tokens.success : tokens.surfaceTertiary },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          { backgroundColor: tokens.surface },
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 84,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  cardCopy: {
    gap: 2,
  },
  centerText: {
    textAlign: "center",
  },
  chip: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  row: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  groupedRow: {
    borderRadius: 0,
    borderWidth: 0,
  },
  rowCopy: {
    flex: 1,
  },
  rowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    position: "absolute",
    right: 0,
  },
  toggleThumb: {
    borderRadius: 13.5,
    height: 27,
    position: "absolute",
    top: 2,
    width: 27,
  },
  toggleThumbOff: {
    left: 2,
  },
  toggleThumbOn: {
    left: 22,
  },
  toggleTrack: {
    borderCurve: "continuous",
    borderRadius: 15.5,
    height: 31,
    width: 51,
  },
})
