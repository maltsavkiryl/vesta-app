import { PropsWithChildren, ReactNode } from "react"
import { Platform, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"
import { firePressHaptic, type PressHapticIntent } from "@/utils/haptics"
import { MotionView } from "./app-motion"

export function GroupedSection({
  actionLabel,
  bodyStyle,
  children,
  actionHaptic = "selection",
  headerContent,
  motionDelay = 0,
  onAction,
  title,
}: PropsWithChildren<{
  actionLabel?: string
  actionHaptic?: PressHapticIntent | "none"
  bodyStyle?: StyleProp<ViewStyle>
  headerContent?: ReactNode
  motionDelay?: number
  onAction?: () => void
  title?: string
}>) {
  const tokens = useDesignTokens()

  return (
    <MotionView delay={motionDelay} style={styles.groupedSection}>
      {title || actionLabel ? (
        <View style={styles.groupedSectionHeader}>
          {title ? (
            <Text
              size="xxs"
              style={[styles.groupedSectionTitle, { color: tokens.textMuted }]}
              text={title}
              weight="semiBold"
            />
          ) : (
            <View />
          )}
          {actionLabel && onAction ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                firePressHaptic(actionHaptic)
                onAction()
              }}
            >
              <Text size="xs" style={{ color: tokens.accent }} text={actionLabel} weight="medium" />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {headerContent}
      <View
        style={[
          styles.groupedSectionBody,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
            shadowColor: tokens.shadow,
          },
          bodyStyle,
        ]}
      >
        {children}
      </View>
    </MotionView>
  )
}

export function ListRow({
  destructive,
  isLast,
  leading,
  onPress,
  pressHaptic = "selection",
  subtitle,
  title,
  trailing,
}: {
  destructive?: boolean
  isLast?: boolean
  leading?: ReactNode
  onPress?: () => void
  pressHaptic?: PressHapticIntent | "none"
  subtitle?: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()
  const content = (
    <>
      {leading}
      <View style={styles.listRowCopy}>
        <Text
          numberOfLines={1}
          size="xs"
          style={{ color: destructive ? tokens.danger : tokens.textPrimary }}
          text={title}
          weight="medium"
        />
        {subtitle ? (
          <Text
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textSecondary }}
            text={subtitle}
          />
        ) : null}
      </View>
      {trailing}
      {!isLast ? (
        <View style={[styles.listRowDivider, { backgroundColor: tokens.separator }]} />
      ) : null}
    </>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          firePressHaptic(pressHaptic)
          onPress()
        }}
        style={({ pressed }) => [
          styles.listRow,
          { backgroundColor: pressed ? tokens.pressed : tokens.transparent },
        ]}
      >
        {content}
      </Pressable>
    )
  }

  return <View style={styles.listRow}>{content}</View>
}

export function DetailRow({
  isLast = false,
  label,
  value,
  valueTextAlign = "right",
  valueTone = "default",
}: {
  isLast?: boolean
  label: string
  value: string
  valueTextAlign?: "left" | "right"
  valueTone?: "default" | "accent" | "success" | "warning" | "danger"
}) {
  const tokens = useDesignTokens()
  const valueColor =
    valueTone === "accent"
      ? tokens.accent
      : valueTone === "success"
        ? tokens.success
        : valueTone === "warning"
          ? tokens.warning
          : valueTone === "danger"
            ? tokens.danger
            : tokens.textPrimary

  return (
    <View style={styles.detailRow}>
      <Text size="xs" style={{ color: tokens.textSecondary }} text={label} />
      <Text
        numberOfLines={2}
        size="xs"
        style={[styles.detailRowValue, { color: valueColor, textAlign: valueTextAlign }]}
        text={value}
        weight="semiBold"
      />
      {!isLast ? (
        <View style={[styles.detailRowDivider, { backgroundColor: tokens.separator }]} />
      ) : null}
    </View>
  )
}

export function ActionRow({
  leading,
  onPress,
  pressHaptic = "selection",
  subtitle,
  title,
  trailing,
}: {
  leading?: ReactNode
  onPress: () => void
  pressHaptic?: PressHapticIntent | "none"
  subtitle: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        firePressHaptic(pressHaptic)
        onPress()
      }}
      style={({ pressed }) => [
        styles.actionRow,
        {
          backgroundColor: pressed ? tokens.pressed : tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      {leading}
      <View style={styles.actionRowCopy}>
        <Text size="xs" style={{ color: tokens.textPrimary }} text={title} weight="semiBold" />
        <Text size="xxs" style={{ color: tokens.textSecondary }} text={subtitle} />
      </View>
      {trailing}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionRowCopy: {
    flex: 1,
    gap: 2,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailRowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 16,
    position: "absolute",
    right: 0,
  },
  detailRowValue: {
    flex: 1,
    minWidth: 0,
  },
  groupedSection: {
    gap: 8,
  },
  groupedSectionBody: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: Platform.select({ android: 1, default: 0 }),
    overflow: "hidden",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: Platform.select({ android: 0, default: 0.04 }),
    shadowRadius: 14,
  },
  groupedSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 22,
    paddingHorizontal: 4,
  },
  groupedSectionTitle: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  listRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listRowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  listRowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 16,
    position: "absolute",
    right: 0,
  },
})
