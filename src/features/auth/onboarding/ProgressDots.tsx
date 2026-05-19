import { StyleSheet, View } from "react-native"

import { useDesignTokens } from "@/ui"

import { ONBOARDING_TOTAL_STEPS } from "./types"

export interface ProgressDotsProps {
  step: number
}

export function ProgressDots({ step }: ProgressDotsProps) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.progressDots}>
      {Array.from({ length: ONBOARDING_TOTAL_STEPS - 1 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === step ? styles.progressDotActive : styles.progressDotInactive,
            {
              backgroundColor:
                index === step ? tokens.accent : index < step ? tokens.accentSoft : tokens.border,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  progressDot: {
    borderRadius: 3,
    height: 6,
  },
  progressDotActive: {
    width: 20,
  },
  progressDotInactive: {
    width: 6,
  },
  progressDots: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
})
