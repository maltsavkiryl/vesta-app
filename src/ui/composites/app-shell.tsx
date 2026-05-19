/* eslint-disable react-native/no-inline-styles */

import { PropsWithChildren, ReactNode, useMemo } from "react"
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import SegmentedControl from "@react-native-segmented-control/segmented-control"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useDesignTokens, type DesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"
import { firePressHaptic, type PressHapticIntent } from "@/utils/haptics"
import { MotionView } from "./app-motion"

type AppScrollScreenVariant = "default" | "grouped"
type TopEdgeTreatment = "auto" | "none"

const headerEyebrowStyle = { letterSpacing: 0 }
const headerTitleStyle = { fontSize: 38, letterSpacing: 0, lineHeight: 42 }

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

export function PageHeader({
  delay = 0,
  eyebrow,
  subtitle,
  title,
  trailing,
}: {
  delay?: number
  eyebrow?: string
  subtitle?: string
  title: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <MotionView delay={delay} style={styles.headerRow}>
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
    </MotionView>
  )
}

export function AppSegmentedControl<T extends string>({
  onChange,
  options,
  pressHaptic = "selection",
  style,
  value,
}: {
  onChange: (value: T) => void
  options: { label: string; value: T }[]
  pressHaptic?: PressHapticIntent | "none"
  style?: StyleProp<ViewStyle>
  value: T
}) {
  const tokens = useDesignTokens()
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const fontStyle = useMemo(
    () => ({ color: tokens.textSecondary, fontSize: 13, fontWeight: "500" as const }),
    [tokens.textSecondary],
  )
  const activeFontStyle = useMemo(
    () => ({ color: tokens.textPrimary, fontSize: 13, fontWeight: "600" as const }),
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
        if (!nextOption) return
        firePressHaptic(pressHaptic)
        onChange(nextOption.value)
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

function TopEdgeOverlay({ insetTop, tokens }: { insetTop: number; tokens: DesignTokens }) {
  return (
    <View pointerEvents="none" style={[styles.topEdgeOverlay, { height: insetTop + 24 }]}>
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

const styles = StyleSheet.create({
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
  screenContent: {
    gap: 18,
    paddingHorizontal: 24,
  },
  segmentedControl: {
    borderRadius: 14,
    height: 34,
    overflow: "hidden",
  },
  topEdgeOverlay: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
})
