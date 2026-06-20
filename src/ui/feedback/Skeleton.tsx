import { useEffect } from "react"
import {
  type DimensionValue,
  type LayoutChangeEvent,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import { useAppMotion } from "@/providers/motion-provider"
import { useDesignTokens } from "@/ui/foundations/tokens"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export interface SkeletonProps {
  width?: DimensionValue
  height?: DimensionValue
  radius?: number
  style?: StyleProp<ViewStyle>
}

/**
 * Accessible, theme-tokened shimmer placeholder. Animates a shimmer sweep
 * while data loads. Falls back to a static opacity block when the user has
 * reduced motion enabled.
 *
 * Shimmer approach: a LinearGradient overlay is translated from -width to
 * +width on repeat. Width is measured via onLayout. The gradient colors
 * differ by theme to ensure visibility on both light and dark surfaces.
 */
export function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  const tokens = useDesignTokens()
  const motion = useAppMotion()
  const progress = useSharedValue(0)
  // Use a shared value so useAnimatedStyle worklet can access it on the UI thread
  const containerWidthSV = useSharedValue(0)

  const handleLayout = (event: LayoutChangeEvent) => {
    containerWidthSV.value = event.nativeEvent.layout.width
  }

  useEffect(() => {
    if (motion.shouldReduceMotion) {
      cancelAnimation(progress)
      progress.value = 0
      return
    }

    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    )

    return () => cancelAnimation(progress)
  }, [motion.shouldReduceMotion, progress])

  const shimmerStyle = useAnimatedStyle(() => {
    const cw = containerWidthSV.value
    if (cw === 0) return { transform: [{ translateX: 0 }] }
    // Translate from -cw to +cw
    return { transform: [{ translateX: -cw + progress.value * cw * 2 }] }
  })

  const shimmerColors: [string, string, string] = tokens.isDark
    ? ["transparent", "rgba(255,255,255,0.06)", "transparent"]
    : ["transparent", "rgba(255,255,255,0.65)", "transparent"]

  if (motion.shouldReduceMotion) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel="Loading"
        accessibilityState={{ busy: true }}
        style={[
          { backgroundColor: tokens.surfaceSecondary, borderRadius: radius, height, width },
          styles.staticBlock,
          style,
        ]}
      />
    )
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
      onLayout={handleLayout}
      style={[
        { backgroundColor: tokens.surfaceSecondary, borderRadius: radius, height, width },
        styles.overflow,
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={shimmerColors}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={[StyleSheet.absoluteFill, shimmerStyle]}
      />
    </View>
  )
}

/**
 * Stacked Skeleton lines for text-shaped placeholders. The final line is
 * shortened to mimic a paragraph's ragged edge.
 */
export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastLineWidth = "60%",
  style,
}: {
  lines?: number
  lineHeight?: number
  gap?: number
  lastLineWidth?: DimensionValue
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          radius={lineHeight / 2}
          width={index === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  overflow: {
    overflow: "hidden",
  },
  staticBlock: {
    opacity: 0.55,
  },
})
