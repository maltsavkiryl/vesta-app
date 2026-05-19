import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"
import { AccessibilityInfo, type AccessibilityChangeEventName } from "react-native"

import { useProfileQuery } from "@/features/profile/data/profile.queries"
import {
  normalizeMotionPreference,
  resolveMotionMode,
  type MotionMode,
  type MotionPreference,
} from "@/providers/motion.utils"

export interface AppMotionContextValue {
  enterDistance: number
  enterDuration: number
  mode: MotionMode
  preference: MotionPreference
  prefersReducedMotion: boolean
  shouldReduceMotion: boolean
  staggerStep: number
}

const MotionContext = createContext<AppMotionContextValue | null>(null)

const REDUCE_MOTION_EVENT = "reduceMotionChanged" satisfies AccessibilityChangeEventName

export function MotionProvider({ children }: PropsWithChildren) {
  const { data: profile } = useProfileQuery()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const preference = normalizeMotionPreference(profile?.motionPreference)

  useEffect(() => {
    let isMounted = true

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled: boolean) => {
      if (isMounted) {
        setPrefersReducedMotion(enabled)
      }
    })

    const subscription = AccessibilityInfo.addEventListener(
      REDUCE_MOTION_EVENT,
      (enabled: boolean) => {
        setPrefersReducedMotion(enabled)
      },
    )

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])

  const value = useMemo<AppMotionContextValue>(() => {
    const mode = resolveMotionMode(preference, prefersReducedMotion)
    const shouldReduceMotion = mode === "reduced"

    return {
      enterDistance: shouldReduceMotion ? 0 : 18,
      enterDuration: shouldReduceMotion ? 0 : 240,
      mode,
      preference,
      prefersReducedMotion,
      shouldReduceMotion,
      staggerStep: shouldReduceMotion ? 0 : 48,
    }
  }, [preference, prefersReducedMotion])

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useAppMotion() {
  const context = useContext(MotionContext)
  if (!context) {
    throw new Error("useAppMotion must be used within MotionProvider")
  }
  return context
}
