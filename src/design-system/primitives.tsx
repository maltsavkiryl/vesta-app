/* eslint-disable react-native/no-inline-styles */

import { PropsWithChildren, ReactNode } from "react"
import {
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"

import { useDesignTokens } from "./tokens"

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
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScrollViewProps>) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()

  return (
    <ScrollView
      {...props}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={[styles.flex, { backgroundColor: tokens.background }, props.style]}
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: insets.top + 10,
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
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.surface,
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
        <Pressable onPress={onPress}>
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
  variant?: "primary" | "secondary"
  disabled?: boolean
}) {
  const tokens = useDesignTokens()
  const isPrimary = variant === "primary"

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? tokens.accent : tokens.surfaceSecondary,
          borderColor: isPrimary ? tokens.accent : tokens.border,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        text={label}
        size="xs"
        weight="semiBold"
        style={{ color: isPrimary ? tokens.accentForeground : tokens.textPrimary }}
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
    shadowOpacity: 0.04,
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
})
