/* eslint-disable react-native/no-inline-styles */

import { PropsWithChildren, ReactNode } from "react"
import {
  Platform,
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"

import { useDesignTokens } from "./tokens"
import type { DesignTokens } from "./tokens"

const headerEyebrowStyle = {
  letterSpacing: 0,
}

const headerTitleStyle = {
  fontSize: 38,
  letterSpacing: 0,
  lineHeight: 42,
}

export function AppScrollScreen({
  children,
  contentInsetAdjustmentBehavior = "automatic",
  contentContainerStyle,
  topInset = "safe",
  variant = "default",
  ...props
}: PropsWithChildren<
  ScrollViewProps & { topInset?: "safe" | "none"; variant?: "default" | "grouped" }
>) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const backgroundColor = variant === "grouped" ? tokens.groupedBackground : tokens.background

  return (
    <ScrollView
      {...props}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      keyboardShouldPersistTaps="handled"
      style={[styles.flex, { backgroundColor }, props.style]}
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: topInset === "safe" ? insets.top + 10 : 0,
          paddingBottom: insets.bottom + 28,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        {eyebrow ? (
          <Text
            text={eyebrow.toUpperCase()}
            size="xxs"
            weight="medium"
            style={[headerEyebrowStyle, { color: tokens.textSecondary }]}
          />
        ) : null}
        <Text
          text={title}
          preset="heading"
          style={[headerTitleStyle, { color: tokens.textPrimary }]}
        />
        {subtitle ? (
          <Text text={subtitle} size="xs" style={{ color: tokens.textSecondary, maxWidth: 320 }} />
        ) : null}
      </View>
      {trailing}
    </View>
  )
}

export function HeaderAvatar({ initials }: { initials: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.avatarShell, { backgroundColor: tokens.avatarBackground }]}>
      <Text text={initials} size="sm" weight="semiBold" style={{ color: tokens.avatarText }} />
    </View>
  )
}

export function SurfaceCard({
  children,
  elevated,
  style,
}: PropsWithChildren<{ elevated?: boolean; style?: StyleProp<ViewStyle> }>) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? tokens.surfaceElevated : tokens.surface,
          borderColor: tokens.border,
          shadowColor: tokens.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function SectionTitle({
  title,
  actionLabel,
  onPress,
}: {
  title: string
  actionLabel?: string
  onPress?: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.sectionHeader}>
      <Text
        text={title}
        size="md"
        weight="semiBold"
        style={{ color: tokens.textPrimary, fontSize: 20, lineHeight: 24 }}
      />
      {actionLabel && onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text text={actionLabel} size="xs" weight="medium" style={{ color: tokens.accent }} />
        </Pressable>
      ) : null}
    </View>
  )
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string
  onPress: () => void
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
}) {
  const tokens = useDesignTokens()
  const isPrimary = variant === "primary"
  const isDanger = variant === "danger"

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary
            ? tokens.accent
            : isDanger
              ? tokens.danger
              : tokens.surfaceSecondary,
          borderColor: isPrimary ? tokens.accent : isDanger ? tokens.danger : tokens.border,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        text={label}
        size="xs"
        weight="semiBold"
        style={{ color: isPrimary || isDanger ? tokens.accentForeground : tokens.textPrimary }}
      />
    </Pressable>
  )
}

export function Pill({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "accent" | "success" | "warning" | "danger"
}) {
  const tokens = useDesignTokens()
  const palette = {
    neutral: { backgroundColor: tokens.surfaceTertiary, color: tokens.textSecondary },
    accent: { backgroundColor: tokens.accentSoft, color: tokens.accent },
    success: { backgroundColor: `${tokens.success}22`, color: tokens.success },
    warning: { backgroundColor: `${tokens.warning}22`, color: tokens.warning },
    danger: { backgroundColor: `${tokens.danger}22`, color: tokens.danger },
  }[tone]

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text text={label} size="xxs" weight="medium" style={{ color: palette.color }} />
    </View>
  )
}

function getTonePalette(
  tokens: DesignTokens,
  tone: "neutral" | "accent" | "success" | "warning" | "danger",
) {
  return {
    accent: { backgroundColor: tokens.accentSoft, color: tokens.accent },
    danger: { backgroundColor: tokens.dangerSoft, color: tokens.danger },
    neutral: { backgroundColor: tokens.surfaceSecondary, color: tokens.textSecondary },
    success: { backgroundColor: tokens.successSoft, color: tokens.success },
    warning: { backgroundColor: tokens.warningSoft, color: tokens.warning },
  }[tone]
}

export function IconButton({
  children,
  accessibilityLabel,
  onPress,
  style,
}: PropsWithChildren<{
  accessibilityLabel: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
}>) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: pressed ? tokens.pressed : tokens.surface,
          borderColor: tokens.border,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "accent" | "success" | "warning" | "danger"
}) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)

  return (
    <View style={[styles.statusBadge, { backgroundColor: palette.backgroundColor }]}>
      <View style={[styles.statusDot, { backgroundColor: palette.color }]} />
      <Text text={label} size="xxs" weight="semiBold" style={{ color: palette.color }} />
    </View>
  )
}

export function GroupedSection({
  children,
  actionLabel,
  title,
  onAction,
}: PropsWithChildren<{
  actionLabel?: string
  title?: string
  onAction?: () => void
}>) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.groupedSection}>
      {title || actionLabel ? (
        <View style={styles.groupedSectionHeader}>
          {title ? (
            <Text
              text={title}
              size="xxs"
              weight="semiBold"
              style={[styles.groupedSectionTitle, { color: tokens.textMuted }]}
            />
          ) : (
            <View />
          )}
          {actionLabel && onAction ? (
            <Pressable accessibilityRole="button" onPress={onAction}>
              <Text text={actionLabel} size="xs" weight="medium" style={{ color: tokens.accent }} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.groupedSectionBody,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
            shadowColor: tokens.shadow,
          },
        ]}
      >
        {children}
      </View>
    </View>
  )
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  destructive,
  isLast,
}: {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  onPress?: () => void
  destructive?: boolean
  isLast?: boolean
}) {
  const tokens = useDesignTokens()
  const content = (
    <>
      {leading}
      <View style={styles.listRowCopy}>
        <Text
          text={title}
          numberOfLines={1}
          size="xs"
          weight="medium"
          style={{ color: destructive ? tokens.danger : tokens.textPrimary }}
        />
        {subtitle ? (
          <Text
            text={subtitle}
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textSecondary }}
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
        onPress={onPress}
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

export function MetricGrid({
  items,
}: {
  items: Array<{
    label: string
    value: string
  }>
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.metricGrid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.metricCell, { backgroundColor: tokens.backgroundMuted }]}
        >
          <Text
            text={item.value}
            numberOfLines={1}
            size="xs"
            weight="bold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={item.label}
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textMuted }}
          />
        </View>
      ))}
    </View>
  )
}

export function NativeSheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: string
  onClose: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.nativeSheetHeader}>
      <View style={styles.headerCopy}>
        <Text text={title} size="lg" weight="bold" style={{ color: tokens.textPrimary }} />
        {subtitle ? (
          <Text text={subtitle} size="xxs" style={{ color: tokens.textSecondary }} />
        ) : null}
      </View>
      <IconButton accessibilityLabel="Close" onPress={onClose}>
        <Ionicons color={tokens.textSecondary} name="close" size={18} />
      </IconButton>
    </View>
  )
}

export function LiquidGlassCloseButton({
  accessibilityLabel = "Close",
  onPress,
}: {
  accessibilityLabel?: string
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const supportsLiquidGlass = Platform.OS === "ios" && isGlassEffectAPIAvailable()

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [
        styles.glassCloseButton,
        {
          backgroundColor: supportsLiquidGlass
            ? tokens.transparent
            : tokens.isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.72)",
          borderColor: supportsLiquidGlass
            ? tokens.transparent
            : tokens.isDark
              ? "rgba(255, 255, 255, 0.16)"
              : "rgba(255, 255, 255, 0.84)",
          opacity: pressed ? 0.78 : 1,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      {supportsLiquidGlass ? (
        <GlassView
          colorScheme={tokens.isDark ? "dark" : "light"}
          glassEffectStyle="regular"
          isInteractive
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Ionicons color={tokens.textSecondary} name="close" size={16} />
    </Pressable>
  )
}

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard>
      <View style={styles.emptyState}>
        <Text text={title} size="sm" weight="semiBold" style={{ color: tokens.textPrimary }} />
        <Text
          text={subtitle}
          size="xs"
          style={{ color: tokens.textSecondary, textAlign: "center" }}
        />
      </View>
    </SurfaceCard>
  )
}

const styles = StyleSheet.create({
  avatarShell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 22,
    height: 46,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: 46,
  },
  button: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  card: {
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    gap: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.select({ android: 0, default: 0.04 }),
    shadowRadius: 14,
  },
  emptyState: {
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 28,
  },
  flex: {
    flex: 1,
  },
  glassCloseButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: Platform.select({ android: 0, default: 0.08 }),
    shadowRadius: 8,
    width: 30,
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
    shadowOffset: { width: 0, height: 8 },
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
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: "center",
    width: 34,
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
  metricCell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 8,
  },
  nativeSheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  pill: {
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  screenContent: {
    gap: 18,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
})
