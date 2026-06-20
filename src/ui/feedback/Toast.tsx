import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { StyleSheet } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppMotion } from "@/providers/motion-provider"
import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

import { SPRING_SNAPPY } from "@/ui/foundations/motion"

export type ToastVariant = "success" | "error" | "info" | "warning"

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let _idCounter = 0
function generateId(): string {
  return `toast-${++_idCounter}-${Date.now()}`
}

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "!",
  info: "i",
  warning: "⚠",
}

function getVariantColors(
  variant: ToastVariant,
  tokens: ReturnType<typeof useDesignTokens>,
) {
  switch (variant) {
    case "success":
      return { bg: tokens.successSoft, text: tokens.success }
    case "error":
      return { bg: tokens.dangerSoft, text: tokens.danger }
    case "info":
      return { bg: tokens.accentSoft, text: tokens.accent }
    case "warning":
      return { bg: tokens.warningSoft, text: tokens.warning }
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([])
  const [current, setCurrent] = useState<ToastItem | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { shouldReduceMotion } = useAppMotion()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()

  const translateY = useSharedValue(-100)
  const opacity = useSharedValue(0)

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 3500) => {
      const item: ToastItem = { id: generateId(), message, variant, duration }
      setQueue((prev) => [...prev, item])
    },
    [],
  )

  // Process queue: pop next when current slot is free
  useEffect(() => {
    if (current !== null) return
    if (queue.length === 0) return

    const next = queue[0]
    setQueue((prev) => prev.slice(1))
    setCurrent(next)
  }, [current, queue])

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (shouldReduceMotion) {
      translateY.value = -100
      opacity.value = 0
      setCurrent(null)
      return
    }

    translateY.value = withSpring(-100, SPRING_SNAPPY)
    opacity.value = withTiming(0, { duration: 160 })
    setTimeout(() => setCurrent(null), 300)
  }, [shouldReduceMotion, translateY, opacity])

  useEffect(() => {
    if (!current) return

    if (shouldReduceMotion) {
      translateY.value = 0
      opacity.value = 1
    } else {
      translateY.value = withSpring(0, SPRING_SNAPPY)
      opacity.value = withTiming(1, { duration: 160 })
    }

    timerRef.current = setTimeout(() => dismiss(), current.duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {current ? (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top + 8,
              backgroundColor: getVariantColors(current.variant, tokens).bg,
              borderRadius: tokens.radiusMd,
            },
            animatedStyle,
          ]}
        >
          <Text
            size="sm"
            style={{ color: getVariantColors(current.variant, tokens).text, marginRight: 6 }}
            text={VARIANT_ICONS[current.variant]}
            weight="semiBold"
          />
          <Text
            size="sm"
            style={{ color: getVariantColors(current.variant, tokens).text, flex: 1 }}
            text={current.message}
          />
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
} {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const showSuccess = useCallback(
    (message: string, duration?: number) => ctx.showToast(message, "success", duration),
    [ctx],
  )
  const showError = useCallback(
    (message: string, duration?: number) => ctx.showToast(message, "error", duration),
    [ctx],
  )
  const showInfo = useCallback(
    (message: string, duration?: number) => ctx.showToast(message, "info", duration),
    [ctx],
  )
  const showWarning = useCallback(
    (message: string, duration?: number) => ctx.showToast(message, "warning", duration),
    [ctx],
  )

  return {
    showToast: ctx.showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}

const styles = StyleSheet.create({
  toastContainer: {
    alignItems: "center",
    elevation: 12,
    flexDirection: "row",
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    right: 16,
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    zIndex: 9999,
  },
})
