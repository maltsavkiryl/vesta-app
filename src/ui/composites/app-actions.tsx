import { PropsWithChildren, ReactNode } from "react"
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { isLiquidGlassAvailable } from "expo-glass-effect"
import Animated from "react-native-reanimated"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"
import { firePressHaptic, type PressHapticIntent } from "@/utils/haptics"

import { usePressScale } from "./app-motion"
import { getTonePalette, type AppTone } from "./appTone"

/**
 * Accessibility conventions for shared interactive primitives
 * ----------------------------------------------------------
 * Every pressable in the design system MUST:
 *  - set `accessibilityRole="button"` (screen readers announce it as a button),
 *  - expose an `accessibilityLabel` (falls back to the visible label),
 *  - forward `accessibilityState` (e.g. `{ disabled }`),
 *  - guarantee a >=44pt touch target — visually-smaller controls (icon buttons,
 *    inline text actions) add `hitSlop` to reach the 44pt minimum.
 * Screens inherit this for free by composing these primitives; per-screen
 * labels for dynamic content are handled in F7.
 */

// Expands a sub-44pt control's touch target to the 44pt minimum (icon button is
// 34pt: 34 + 2*6 = 46 >= 44). Inline text actions reuse the same slop.
const MIN_TOUCH_HIT_SLOP = 6

type AppButtonVariant = "primary" | "secondary" | "danger"

export function SectionTitle({
  actionIcon,
  actionLabel,
  actionHaptic = "selection",
  badgeLabel,
  onAction,
  onPress,
  title,
  titleSize = "md",
  trailing,
}: {
  actionIcon?: ReactNode
  actionLabel?: string
  actionHaptic?: PressHapticIntent | "none"
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
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            hitSlop={MIN_TOUCH_HIT_SLOP}
            onPress={() => {
              firePressHaptic(actionHaptic)
              actionHandler()
            }}
            style={styles.inlineAction}
          >
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
  accessibilityLabel,
  disabled,
  fullWidth = false,
  isLoading,
  label,
  onPress,
  pressHaptic = "selection",
  variant = "primary",
}: {
  accessibilityLabel?: string
  disabled?: boolean
  fullWidth?: boolean
  isLoading?: boolean
  label: string
  onPress: () => void
  pressHaptic?: PressHapticIntent | "none"
  variant?: AppButtonVariant
}) {
  const tokens = useDesignTokens()
  const isPrimary = variant === "primary"
  const isDanger = variant === "danger"
  const isDisabled = disabled || isLoading
  const { animatedStyle, pressHandlers } = usePressScale({ disabled: isDisabled })

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
      nativeDisabled(Boolean(isDisabled)),
    ]

    if (variant === "primary") modifiers.push(tint(tokens.accent))
    if (variant === "danger") modifiers.push(tint(tokens.danger))

    return (
      <View style={styles.nativeButtonWrapper}>
        <Host style={styles.nativeButtonHost}>
          <NativeButton
            label={label}
            modifiers={modifiers}
            onPress={() => {
              firePressHaptic(pressHaptic)
              onPress()
            }}
            role={isDanger ? "destructive" : "default"}
          />
        </Host>
      </View>
    )
  }

  return (
    <Animated.View style={[fullWidth ? styles.buttonFullWidth : null, animatedStyle]}>
      <Pressable
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(isDisabled) }}
        disabled={isDisabled}
        onPress={() => {
          firePressHaptic(pressHaptic)
          onPress()
        }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isPrimary
              ? tokens.accent
              : isDanger
                ? tokens.danger
                : tokens.surfaceSecondary,
            borderColor: isPrimary ? tokens.accent : isDanger ? tokens.danger : tokens.border,
            opacity: isDisabled ? (isLoading ? 0.8 : 0.55) : pressed ? 0.88 : 1,
          },
        ]}
        {...pressHandlers}
      >
        {isLoading ? (
          <ActivityIndicator
            color={isPrimary || isDanger ? tokens.accentForeground : tokens.textPrimary}
            size="small"
          />
        ) : (
          <Text
            size="xs"
            style={{ color: isPrimary || isDanger ? tokens.accentForeground : tokens.textPrimary }}
            text={label}
            weight="semiBold"
          />
        )}
      </Pressable>
    </Animated.View>
  )
}

export function InCardActionButton({
  disabled,
  icon,
  label,
  onPress,
  pressHaptic = "none",
  stopPropagation = false,
}: {
  disabled?: boolean
  icon?: ReactNode
  label: string
  onPress: () => void
  pressHaptic?: PressHapticIntent | "none"
  stopPropagation?: boolean
}) {
  const tokens = useDesignTokens()
  const { animatedStyle, pressHandlers } = usePressScale({ disabled })

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={(event) => {
          if (stopPropagation) event.stopPropagation()
          firePressHaptic(pressHaptic)
          onPress()
        }}
        style={({ pressed }) => [
          styles.inCardActionButton,
          {
            backgroundColor: tokens.accent,
            opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
          },
        ]}
        {...pressHandlers}
      >
        {icon}
        <Text size="xs" style={{ color: tokens.accentForeground }} text={label} weight="semiBold" />
      </Pressable>
    </Animated.View>
  )
}

export function IconButton({
  accessibilityLabel,
  children,
  onPress,
  pressHaptic = "selection",
  style,
  tone = "neutral",
  variant = "surface",
}: PropsWithChildren<{
  accessibilityLabel: string
  onPress: () => void
  pressHaptic?: PressHapticIntent | "none"
  style?: StyleProp<ViewStyle>
  tone?: AppTone
  variant?: "surface" | "soft" | "solid"
}>) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone, variant === "solid" ? "solid" : "soft")
  const { animatedStyle, pressHandlers } = usePressScale({})

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        hitSlop={MIN_TOUCH_HIT_SLOP}
        onPress={() => {
          firePressHaptic(pressHaptic)
          onPress()
        }}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor:
              variant === "solid" || variant === "soft"
                ? palette.backgroundColor
                : pressed
                  ? tokens.pressed
                  : tokens.surface,
            borderColor:
              variant === "solid" || variant === "soft" ? palette.borderColor : tokens.border,
            opacity: pressed ? 0.88 : 1,
          },
          style,
        ]}
        {...pressHandlers}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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
  nativeButtonHost: {
    justifyContent: "center",
    minHeight: 52,
    width: "100%",
  },
  nativeButtonWrapper: {
    alignSelf: "stretch",
    minHeight: 52,
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
})
