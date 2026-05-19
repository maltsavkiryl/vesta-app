/* eslint-disable react-native/no-inline-styles */

import { ReactNode } from "react"
import { type StyleProp, StyleSheet, View, type ViewStyle, type TextStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

import { SurfaceCard } from "./app-shell"
import { getTonePalette, type AppTone } from "./appTone"

export function Pill({ label, tone = "neutral" }: { label: string; tone?: AppTone }) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text size="xxs" style={{ color: palette.color }} text={label} weight="medium" />
    </View>
  )
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: AppTone }) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)

  return (
    <View style={[styles.statusBadge, { backgroundColor: palette.backgroundColor }]}>
      <View style={[styles.statusDot, { backgroundColor: palette.color }]} />
      <Text size="xxs" style={{ color: palette.color }} text={label} weight="semiBold" />
    </View>
  )
}

export function MetaPill({
  backgroundColor,
  label,
  leading,
  style,
  textStyle,
  tone = "neutral",
}: {
  backgroundColor?: string
  label: string
  leading?: ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  tone?: AppTone
}) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)

  return (
    <View
      style={[
        styles.metaPill,
        { backgroundColor: backgroundColor ?? palette.backgroundColor },
        style,
      ]}
    >
      {leading}
      <Text size="xxs" style={[{ color: palette.color }, textStyle]} text={label} weight="medium" />
    </View>
  )
}

export function MetricGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.metricGrid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.metricCell, { backgroundColor: tokens.backgroundMuted }]}
        >
          <Text
            numberOfLines={1}
            size="xs"
            style={{ color: tokens.textPrimary }}
            text={item.value}
            weight="bold"
          />
          <Text
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textMuted }}
            text={item.label}
          />
        </View>
      ))}
    </View>
  )
}

export function EmptyState({ subtitle, title }: { subtitle: string; title: string }) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard>
      <View style={styles.emptyState}>
        <Text size="sm" style={{ color: tokens.textPrimary }} text={title} weight="semiBold" />
        <Text
          size="xs"
          style={{ color: tokens.textSecondary, textAlign: "center" }}
          text={subtitle}
        />
      </View>
    </SurfaceCard>
  )
}

export function ProgressBar({
  fillColor,
  progress,
  style,
  thickness = 4,
  trackColor,
}: {
  fillColor?: string
  progress: number
  style?: StyleProp<ViewStyle>
  thickness?: number
  trackColor?: string
}) {
  const tokens = useDesignTokens()
  const width = `${Math.max(0, Math.min(progress, 100))}%` as `${number}%`

  return (
    <View
      style={[
        styles.progressTrack,
        { backgroundColor: trackColor ?? tokens.backgroundMuted, height: thickness },
        style,
      ]}
    >
      <View style={[styles.progressFill, { backgroundColor: fillColor ?? tokens.accent, width }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 28,
  },
  metaPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricCell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressTrack: {
    borderCurve: "continuous",
    borderRadius: 999,
    height: 4,
    overflow: "hidden",
  },
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
})
