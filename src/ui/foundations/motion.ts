import { useCallback, useEffect } from "react"
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated"

import { useAppMotion } from "@/providers/motion-provider"

// Spring presets
export const SPRING_GENTLE = { damping: 26, stiffness: 180, mass: 1 }
export const SPRING_SNAPPY = { damping: 22, stiffness: 280, mass: 0.8 }

// Screen transition preset
export const SCREEN_TRANSITION_SPRING = SPRING_GENTLE

// Duration constants
export const DURATION_FAST = 160
export const DURATION_NORMAL = 240
export const DURATION_SLOW = 380

/**
 * Returns the delay in ms for a staggered list item at `index`.
 */
export function getStaggerDelay(index: number, baseDelay = 0, step = 48): number {
  return baseDelay + index * step
}

/**
 * Spring-based entrance animation for a list item at `index`.
 * Respects shouldReduceMotion — instant if reduced.
 */
export function useListItemEntrance(
  index: number,
  options?: { baseDelay?: number; step?: number },
): { animatedStyle: object } {
  const { shouldReduceMotion } = useAppMotion()
  const { baseDelay = 0, step = 48 } = options ?? {}

  const opacity = useSharedValue(shouldReduceMotion ? 1 : 0)
  const translateY = useSharedValue(shouldReduceMotion ? 0 : 16)

  useEffect(() => {
    if (shouldReduceMotion) {
      opacity.value = 1
      translateY.value = 0
      return
    }

    const delay = getStaggerDelay(index, baseDelay, step)
    opacity.value = withDelay(delay, withSpring(1, SPRING_GENTLE))
    translateY.value = withDelay(delay, withSpring(0, SPRING_GENTLE))
  }, [index, baseDelay, step, shouldReduceMotion, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return { animatedStyle }
}

/**
 * Pulse animation for success/celebrate moments (task check-off, claim success).
 * Call `triggerPulse()` to animate scale 1→1.06→1.
 * No-op when shouldReduceMotion is true.
 */
export function useCelebratePulse(): { animatedStyle: object; triggerPulse: () => void } {
  const { shouldReduceMotion } = useAppMotion()
  const scale = useSharedValue(1)

  const triggerPulse = useCallback(() => {
    if (shouldReduceMotion) return
    scale.value = withSequence(withSpring(1.06, SPRING_SNAPPY), withSpring(1, SPRING_SNAPPY))
  }, [shouldReduceMotion, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return { animatedStyle, triggerPulse }
}
