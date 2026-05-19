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
            {
              backgroundColor:
                index === step ? tokens.accent : index < step ? tokens.accentSoft : tokens.border,
              width: index === step ? 20 : 6,
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
  progressDots: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
})
