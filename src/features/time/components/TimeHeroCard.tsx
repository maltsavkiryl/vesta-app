import type { PropsWithChildren } from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import { SurfaceCard } from "@/ui"

const HERO_BACKGROUND = "#020408"
const HERO_BORDER = "rgba(83, 145, 255, 0.26)"
const HERO_EDGE_BORDER = "rgba(255, 255, 255, 0.06)"
const HERO_SHADOW = "#1A4EA9"

export const timeHeroColors = {
  primaryText: "#F4F7FF",
  secondaryText: "rgba(231, 238, 255, 0.78)",
  tertiaryText: "rgba(214, 225, 255, 0.66)",
  divider: "rgba(255, 255, 255, 0.10)",
} as const

type TimeHeroCardVariant = "default" | "compact"

export function TimeHeroCard({
  children,
  contentStyle,
  gradientVariant,
  style,
  variant = "default",
}: PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>
  gradientVariant?: TimeHeroCardVariant
  style?: StyleProp<ViewStyle>
  variant?: TimeHeroCardVariant
}>) {
  const isCompact = variant === "compact"
  const appliedGradientVariant = gradientVariant ?? variant
  const usesCompactGradient = appliedGradientVariant === "compact"

  return (
    <SurfaceCard
      elevated
      style={[styles.baseCard, isCompact ? styles.compactCard : styles.defaultCard, style]}
    >
      <LinearGradient
        colors={["#020408", "#050919", "#0A1428"]}
        end={{ x: 0.92, y: 0.08 }}
        pointerEvents="none"
        start={{ x: 0.08, y: 0.98 }}
        style={styles.heroGradient}
      />
      <LinearGradient
        colors={[
          "rgba(60, 110, 220, 0.14)",
          "rgba(60, 110, 220, 0.06)",
          "rgba(60, 110, 220, 0.00)",
        ]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0.52, y: 0.48 }}
        style={[
          styles.heroTopBloom,
          usesCompactGradient ? styles.compactTopBloom : styles.defaultTopBloom,
        ]}
      />
      <LinearGradient
        colors={[
          "rgba(100, 140, 220, 0.07)",
          "rgba(100, 140, 220, 0.03)",
          "rgba(100, 140, 220, 0.00)",
        ]}
        end={{ x: 0.3, y: 0.62 }}
        pointerEvents="none"
        start={{ x: 0, y: 1 }}
        style={[
          styles.heroBottomBloom,
          usesCompactGradient ? styles.compactBottomBloom : styles.defaultBottomBloom,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.heroEdgeHighlight,
          usesCompactGradient ? styles.compactEdgeHighlight : styles.defaultEdgeHighlight,
        ]}
      />
      <View style={contentStyle}>{children}</View>
    </SurfaceCard>
  )
}

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: HERO_BACKGROUND,
    borderColor: HERO_BORDER,
    borderWidth: 1,
    overflow: "hidden",
  },
  compactBottomBloom: {
    opacity: 0.5,
  },
  compactCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: HERO_SHADOW,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
  compactEdgeHighlight: {
    borderColor: HERO_EDGE_BORDER,
    borderRadius: 16,
    borderWidth: 1,
  },
  compactTopBloom: {
    opacity: 0.9,
  },
  defaultBottomBloom: {
    borderRadius: 240,
    bottom: -108,
    height: 228,
    left: -92,
    opacity: 0.5,
    position: "absolute",
    width: 284,
  },
  defaultCard: {
    borderRadius: 24,
    elevation: 18,
    padding: 20,
    shadowColor: HERO_SHADOW,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
  defaultEdgeHighlight: {
    borderColor: HERO_EDGE_BORDER,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
  defaultTopBloom: {
    borderRadius: 260,
    height: 236,
    opacity: 0.9,
    position: "absolute",
    right: -34,
    top: -84,
    width: 236,
  },
  heroBottomBloom: {
    ...StyleSheet.absoluteFillObject,
  },
  heroEdgeHighlight: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopBloom: {
    ...StyleSheet.absoluteFillObject,
  },
})
