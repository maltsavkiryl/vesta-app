import { useEffect } from "react"
import { type DimensionValue, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
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

export interface SkeletonProps {
  width?: DimensionValue
  height?: DimensionValue
  radius?: number
  style?: StyleProp<ViewStyle>
}

/**
 * Accessible, theme-tokened shimmer placeholder. Animates a gentle opacity
 * pulse while data loads, and collapses to a static block when the user has
 * reduced motion enabled.
 */
export function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  const tokens = useDesignTokens()
  const motion = useAppMotion()
  const progress = useSharedValue(0)

  useEffect(() => {
    if (motion.shouldReduceMotion) {
      cancelAnimation(progress)
      progress.value = 0
      return
    }

    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )

    return () => cancelAnimation(progress)
  }, [motion.shouldReduceMotion, progress])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + progress.value * 0.4,
  }))

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
      style={[
        { backgroundColor: tokens.surfaceSecondary, borderRadius: radius, height, width },
        motion.shouldReduceMotion ? styles.staticBlock : animatedStyle,
        style,
      ]}
    />
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
  staticBlock: {
    opacity: 0.55,
  },
})
