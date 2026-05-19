import { PropsWithChildren, useEffect } from "react"
import { Pressable, type StyleProp, type ViewStyle } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"

import { useAppMotion } from "@/providers/motion-provider"

const AnimatedView = Animated.View

export function MotionView({
  children,
  delay = 0,
  distance,
  style,
  visible = true,
}: PropsWithChildren<{
  delay?: number
  distance?: number
  style?: StyleProp<ViewStyle>
  visible?: boolean
}>) {
  const motion = useAppMotion()
  const progress = useSharedValue(motion.shouldReduceMotion ? 1 : visible ? 0 : 1)
  const translateDistance = distance ?? motion.enterDistance

  useEffect(() => {
    if (!visible) {
      progress.value = withTiming(0, {
        duration: motion.shouldReduceMotion ? 0 : 140,
        easing: Easing.out(Easing.quad),
      })
      return
    }

    if (motion.shouldReduceMotion) {
      progress.value = 1
      return
    }

    progress.value = 0
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: motion.enterDuration,
        easing: Easing.out(Easing.cubic),
      }),
    )
  }, [delay, motion.enterDuration, motion.shouldReduceMotion, progress, visible])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * translateDistance }],
  }))

  return <AnimatedView style={[style, animatedStyle]}>{children}</AnimatedView>
}

export function usePressScale({
  disabled,
  pressedScale = 0.985,
}: {
  disabled?: boolean
  pressedScale?: number
}) {
  const motion = useAppMotion()
  const scale = useSharedValue(1)

  const animateTo = (nextValue: number, duration: number) => {
    if (disabled || motion.shouldReduceMotion) {
      scale.value = 1
      return
    }

    scale.value = withTiming(nextValue, {
      duration,
      easing: Easing.out(Easing.quad),
    })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return {
    animatedStyle,
    pressHandlers: {
      onPressIn: () => animateTo(pressedScale, 110),
      onPressOut: () => animateTo(1, 160),
    },
  }
}

export function MotionPressable({
  children,
  delay = 0,
  onPress,
  style,
}: PropsWithChildren<{
  delay?: number
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}>) {
  const { animatedStyle, pressHandlers } = usePressScale({})

  return (
    <MotionView delay={delay} style={style}>
      <Pressable onPress={onPress} {...pressHandlers}>
        <AnimatedView style={animatedStyle}>{children}</AnimatedView>
      </Pressable>
    </MotionView>
  )
}
