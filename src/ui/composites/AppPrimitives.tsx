/* eslint-disable react-native/no-inline-styles */

import { PropsWithChildren, ReactNode, useMemo } from "react"
import {
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextStyle,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native"
import { isLiquidGlassAvailable } from "expo-glass-effect"
import { LinearGradient } from "expo-linear-gradient"
import SegmentedControl from "@react-native-segmented-control/segmented-control"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useDesignTokens, type DesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

type AppButtonVariant = "primary" | "secondary" | "danger"
type AppScrollScreenVariant = "default" | "grouped"
type TopEdgeTreatment = "auto" | "none"

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
  topEdgeTreatment = "auto",
  topInset = "safe",
  variant = "default",
  ...props
}: PropsWithChildren<
  ScrollViewProps & {
    topEdgeTreatment?: TopEdgeTreatment
    topInset?: "safe" | "none"
    variant?: AppScrollScreenVariant
  }
>) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const backgroundColor = variant === "grouped" ? tokens.groupedBackground : tokens.background
  const shouldShowTopEdgeTreatment = topInset === "safe" && topEdgeTreatment === "auto"

  return (
    <View style={[styles.flex, { backgroundColor }]}>
      <ScrollView
        {...props}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        contentContainerStyle={[
          styles.screenContent,
          {
            paddingBottom: insets.bottom + 28,
            paddingTop: topInset === "safe" ? 18 : 0,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        style={[styles.flex, props.style]}
      >
        {children}
      </ScrollView>
      {shouldShowTopEdgeTreatment ? <TopEdgeOverlay insetTop={insets.top} tokens={tokens} /> : null}
    </View>
  )
}

function TopEdgeOverlay({ insetTop, tokens }: { insetTop: number; tokens: DesignTokens }) {
  const overlayHeight = insetTop + 24

  return (
    <View pointerEvents="none" style={[styles.topEdgeOverlay, { height: overlayHeight }]}>
      <LinearGradient
        colors={getTopEdgeGradientColors(tokens)}
        end={{ x: 0.5, y: 1 }}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  )
}

function getTopEdgeGradientColors(tokens: DesignTokens): readonly [string, string, string] {
  if (tokens.isDark) {
    return ["rgba(0, 0, 0, 0.42)", "rgba(0, 0, 0, 0.10)", "rgba(0, 0, 0, 0.00)"]
  }

  return ["rgba(255, 255, 255, 0.62)", "rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.00)"]
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
}: {
  eyebrow?: string
  subtitle?: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        {eyebrow ? (
          <Text
            size="xxs"
            style={[headerEyebrowStyle, { color: tokens.textSecondary }]}
            text={eyebrow.toUpperCase()}
            weight="medium"
          />
        ) : null}
        <Text
          preset="heading"
          style={[headerTitleStyle, { color: tokens.textPrimary }]}
          text={title}
        />
        {subtitle ? (
          <Text size="xs" style={{ color: tokens.textSecondary, maxWidth: 320 }} text={subtitle} />
        ) : null}
      </View>
      {trailing}
    </View>
  )
}

export function AppSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  onChange: (value: T) => void
  options: { label: string; value: T }[]
  style?: StyleProp<ViewStyle>
  value: T
}) {
  const tokens = useDesignTokens()
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const fontStyle = useMemo(
    () => ({
      color: tokens.textSecondary,
      fontSize: 13,
      fontWeight: "500" as const,
    }),
    [tokens.textSecondary],
  )
  const activeFontStyle = useMemo(
    () => ({
      color: tokens.textPrimary,
      fontSize: 13,
      fontWeight: "600" as const,
    }),
    [tokens.textPrimary],
  )

  return (
    <SegmentedControl
      activeFontStyle={activeFontStyle}
      appearance={tokens.isDark ? "dark" : "light"}
      backgroundColor={tokens.isDark ? "rgba(116, 116, 128, 0.22)" : "rgba(116, 116, 128, 0.10)"}
      fontStyle={fontStyle}
      onChange={(event) => {
        const nextOption = options[event.nativeEvent.selectedSegmentIndex]
        if (nextOption) onChange(nextOption.value)
      }}
      selectedIndex={selectedIndex}
      style={[styles.segmentedControl, style]}
      tintColor={tokens.surface}
      values={options.map((option) => option.label)}
    />
  )
}

export function HeaderAvatar({ initials }: { initials: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.avatarShell, { backgroundColor: tokens.avatarBackground }]}>
      <Text size="sm" style={{ color: tokens.avatarText }} text={initials} weight="semiBold" />
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
  actionIcon,
  actionLabel,
  badgeLabel,
  onAction,
  onPress,
  title,
  trailing,
  titleSize = "md",
}: {
  actionIcon?: ReactNode
  actionLabel?: string
  badgeLabel?: string
  onAction?: () => void
  onPress?: () => void
  title: string
  titleSize?: "md" | "sm"
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()
  const actionHandler = onAction ?? onPress
  const textSize = titleSize === "sm" ? "sm" : "md"

  return (
    <View style={styles.sectionHeader}>
      <Text size={textSize} style={{ color: tokens.textPrimary }} text={title} weight="semiBold" />
      <View style={styles.sectionHeaderActions}>
        {badgeLabel ? (
          <View style={[styles.sectionBadge, { backgroundColor: `${tokens.danger}14` }]}>
            <Text size="xxs" style={{ color: tokens.danger }} text={badgeLabel} weight="semiBold" />
          </View>
        ) : null}
        {actionLabel && actionHandler ? (
          <Pressable accessibilityRole="button" onPress={actionHandler} style={styles.inlineAction}>
            <Text size="xs" style={{ color: tokens.accent }} text={actionLabel} weight="medium" />
            {actionIcon}
          </Pressable>
        ) : null}
        {trailing}
      </View>
    </View>
  )
}

export function AppButton({
  fullWidth = false,
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  disabled?: boolean
  fullWidth?: boolean
  label: string
  onPress: () => void
  variant?: AppButtonVariant
}) {
  const tokens = useDesignTokens()
  const isPrimary = variant === "primary"
  const isDanger = variant === "danger"

  if (Platform.OS === "ios" && !fullWidth) {
    const { Button: NativeButton, Host } =
      require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
    const {
      buttonStyle,
      controlSize,
      disabled: nativeDisabled,
      tint,
    } = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")

    const supportsLiquidGlass = isLiquidGlassAvailable()
    const nativeStyle =
      variant === "secondary"
        ? supportsLiquidGlass
          ? "glass"
          : "bordered"
        : supportsLiquidGlass
          ? "glassProminent"
          : "borderedProminent"
    const modifiers = [
      buttonStyle(nativeStyle),
      controlSize("large"),
      nativeDisabled(Boolean(disabled)),
    ]

    if (variant === "primary") modifiers.push(tint(tokens.accent))
    if (variant === "danger") modifiers.push(tint(tokens.danger))

    return (
      <View style={styles.nativeButtonWrapper}>
        <Host style={styles.nativeButtonHost}>
          <NativeButton
            label={label}
            modifiers={modifiers}
            onPress={onPress}
            role={isDanger ? "destructive" : "default"}
          />
        </Host>
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        fullWidth ? styles.buttonFullWidth : null,
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
        size="xs"
        style={{ color: isPrimary || isDanger ? tokens.accentForeground : tokens.textPrimary }}
        text={label}
        weight="semiBold"
      />
    </Pressable>
  )
}

export function InCardActionButton({
  label,
  onPress,
  icon,
  disabled,
  stopPropagation = false,
}: {
  disabled?: boolean
  icon?: ReactNode
  label: string
  onPress: () => void
  stopPropagation?: boolean
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(event) => {
        if (stopPropagation) event.stopPropagation()
        onPress()
      }}
      style={({ pressed }) => [
        styles.inCardActionButton,
        {
          backgroundColor: tokens.accent,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
        },
      ]}
    >
      {icon}
      <Text size="xs" style={{ color: tokens.accentForeground }} text={label} weight="semiBold" />
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
    accent: { backgroundColor: tokens.accentSoft, color: tokens.accent },
    danger: { backgroundColor: `${tokens.danger}22`, color: tokens.danger },
    neutral: { backgroundColor: tokens.surfaceTertiary, color: tokens.textSecondary },
    success: { backgroundColor: `${tokens.success}22`, color: tokens.success },
    warning: { backgroundColor: `${tokens.warning}22`, color: tokens.warning },
  }[tone]

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text size="xxs" style={{ color: palette.color }} text={label} weight="medium" />
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
  tone = "neutral",
  variant = "surface",
  style,
}: PropsWithChildren<{
  accessibilityLabel: string
  onPress: () => void
  tone?: "neutral" | "accent" | "success" | "warning" | "danger"
  variant?: "surface" | "soft"
  style?: StyleProp<ViewStyle>
}>) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor:
            variant === "soft"
              ? pressed
                ? palette.backgroundColor
                : palette.backgroundColor
              : pressed
                ? tokens.pressed
                : tokens.surface,
          borderColor: variant === "soft" ? palette.backgroundColor : tokens.border,
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
      <Text size="xxs" style={{ color: palette.color }} text={label} weight="semiBold" />
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
  onAction?: () => void
  title?: string
}>) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.groupedSection}>
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
            <Pressable accessibilityRole="button" onPress={onAction}>
              <Text size="xs" style={{ color: tokens.accent }} text={actionLabel} weight="medium" />
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
  destructive?: boolean
  isLast?: boolean
  leading?: ReactNode
  onPress?: () => void
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

export function DetailRow({
  label,
  value,
  isLast = false,
  valueTone = "default",
  valueTextAlign = "right",
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
            numberOfLines={1}
            size="xs"
            style={{ color: tokens.textPrimary }}
            text={item.value}
            weight="bold"
          />
          <Text
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textMuted }}
            text={item.label}
          />
        </View>
      ))}
    </View>
  )
}

export function EmptyState({ title, subtitle }: { subtitle: string; title: string }) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard>
      <View style={styles.emptyState}>
        <Text size="sm" style={{ color: tokens.textPrimary }} text={title} weight="semiBold" />
        <Text
          size="xs"
          style={{ color: tokens.textSecondary, textAlign: "center" }}
          text={subtitle}
        />
      </View>
    </SurfaceCard>
  )
}

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

export function ActionRow({
  leading,
  onPress,
  subtitle,
  title,
  trailing,
}: {
  leading?: ReactNode
  onPress: () => void
  subtitle: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
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

export function MetaPill({
  label,
  leading,
  backgroundColor,
  style,
  textStyle,
}: {
  backgroundColor?: string
  label: string
  leading?: ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.metaPill,
        { backgroundColor: backgroundColor ?? tokens.surfaceSecondary },
        style,
      ]}
    >
      {leading}
      <Text
        size="xxs"
        style={[{ color: tokens.textPrimary }, textStyle]}
        text={label}
        weight="medium"
      />
    </View>
  )
}

export function ProgressBar({
  progress,
  fillColor,
  trackColor,
  thickness = 4,
  style,
}: {
  fillColor?: string
  progress: number
  style?: StyleProp<ViewStyle>
  thickness?: number
  trackColor?: string
}) {
  const tokens = useDesignTokens()
  const width = `${Math.max(0, Math.min(progress, 100))}%` as `${number}%`

  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: trackColor ?? tokens.backgroundMuted,
          height: thickness,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: fillColor ?? tokens.accent,
            width,
          },
        ]}
      />
    </View>
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
  avatarShell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 22,
    height: 46,
    justifyContent: "center",
    shadowOffset: { height: 6, width: 0 },
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
  buttonFullWidth: {
    alignSelf: "stretch",
  },
  card: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    gap: 12,
    padding: 16,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: Platform.select({ android: 0, default: 0.04 }),
    shadowRadius: 14,
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
  emptyState: {
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 28,
  },
  flex: {
    flex: 1,
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
  inCardActionButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  inlineAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
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
  metaPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  nativeButtonHost: {
    justifyContent: "center",
    minHeight: 52,
    width: "100%",
  },
  nativeButtonWrapper: {
    alignSelf: "stretch",
    minHeight: 52,
  },
  pill: {
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressTrack: {
    borderCurve: "continuous",
    borderRadius: 999,
    height: 4,
    overflow: "hidden",
  },
  screenContent: {
    gap: 18,
    paddingHorizontal: 24,
  },
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
  sectionBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionHeaderActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  segmentedControl: {
    borderRadius: 14,
    height: 34,
    overflow: "hidden",
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
  topEdgeOverlay: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
})
