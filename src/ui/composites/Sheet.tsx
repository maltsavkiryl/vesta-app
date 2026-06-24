import { ReactNode, useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet, View, type DimensionValue } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { translate } from "@/i18n/translate"
import { useAppMotion } from "@/providers/motion-provider"
import { SPRING_SNAPPY } from "@/ui/foundations/motion"
import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** Height of sheet content, e.g. 400 or "60%" */
  snapPoint?: number | string
  title?: string
  accessibilityLabel?: string
}

const DISMISS_THRESHOLD = 80

export function Sheet({
  isOpen,
  onClose,
  children,
  snapPoint = 400,
  title,
  accessibilityLabel,
}: SheetProps) {
  const tokens = useDesignTokens()
  const insets = useSafeAreaInsets()
  const { shouldReduceMotion } = useAppMotion()

  // Track whether we should keep the modal mounted during close animation
  const [isVisible, setIsVisible] = useState(isOpen)

  const translateY = useSharedValue(isOpen ? 0 : 1000)
  const backdropOpacity = useSharedValue(isOpen ? 0.52 : 0)
  const dragOffset = useSharedValue(0)

  const animateClose = (callback: () => void) => {
    if (shouldReduceMotion) {
      backdropOpacity.value = 0
      translateY.value = 1000
      callback()
      return
    }
    backdropOpacity.value = withTiming(0, { duration: 200 })
    translateY.value = withSpring(1000, SPRING_SNAPPY, (finished) => {
      if (finished) {
        runOnJS(callback)()
      }
    })
  }

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      dragOffset.value = 0
      if (shouldReduceMotion) {
        backdropOpacity.value = 0.52
        translateY.value = 0
      } else {
        backdropOpacity.value = withTiming(0.52, { duration: 220 })
        translateY.value = withSpring(0, SPRING_SNAPPY)
      }
    } else {
      animateClose(() => setIsVisible(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const dy = Math.max(0, event.translationY)
      dragOffset.value = dy
      translateY.value = dy
      backdropOpacity.value = Math.max(0, 0.52 - (dy / 300) * 0.52)
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD) {
        runOnJS(onClose)()
      } else {
        dragOffset.value = 0
        translateY.value = withSpring(0, SPRING_SNAPPY)
        backdropOpacity.value = withTiming(0.52, { duration: 180 })
      }
    })

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  if (!isVisible) return null

  const sheetHeight: DimensionValue =
    typeof snapPoint === "string" ? (snapPoint as DimensionValue) : snapPoint

  return (
    <Modal
      accessible
      accessibilityLabel={accessibilityLabel ?? title ?? "Sheet"}
      accessibilityViewIsModal
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={isVisible}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tokens.overlay },
          animatedBackdropStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate("common:a11y.closeSheet")}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Sheet panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            styles.sheet,
            {
              backgroundColor: tokens.surfaceSheet,
              borderTopLeftRadius: tokens.radiusXl,
              borderTopRightRadius: tokens.radiusXl,
              height: sheetHeight,
            },
            animatedSheetStyle,
          ]}
        >
          {/* Drag handle — announced by VoiceOver/TalkBack so users know the sheet is dismissible */}
          <View
            accessible
            accessibilityHint="Drag down to close"
            accessibilityLabel={translate("common:a11y.dragHandle")}
            accessibilityRole="adjustable"
            style={styles.handleContainer}
          >
            <View style={[styles.handle, { backgroundColor: tokens.separator }]} />
          </View>

          {title ? (
            <View style={styles.titleContainer}>
              <Text
                preset="subheading"
                style={{ color: tokens.textPrimary }}
                text={title}
                weight="semiBold"
              />
            </View>
          ) : null}

          {children}

          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </GestureDetector>
    </Modal>
  )
}

const styles = StyleSheet.create({
  handle: {
    borderRadius: 3,
    height: 4,
    width: 36,
  },
  handleContainer: {
    alignItems: "center",
    paddingBottom: 6,
    paddingTop: 10,
  },
  sheet: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  titleContainer: {
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
})
