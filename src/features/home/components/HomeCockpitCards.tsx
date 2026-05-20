import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { MetaPill, SurfaceCard, Text, useDesignTokens } from "@/ui"

import type { CockpitAction } from "./homeCockpit.types"

export function HomeCockpitPrimaryCard({ action }: { action: CockpitAction }) {
  const tokens = useDesignTokens()

  return (
    <Pressable onPress={action.onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <SurfaceCard
        elevated
        style={[
          styles.primaryCard,
          {
            backgroundColor: tokens.surfaceElevated,
            borderColor: `${tokens.accent}18`,
          },
        ]}
      >
        <View style={styles.primaryHeader}>
          <MetaPill
            backgroundColor={`${tokens.accent}10`}
            label="Top focus"
            leading={<Ionicons color={tokens.accent} name="sparkles-outline" size={12} />}
            textStyle={{ color: tokens.accent }}
          />
          <View style={[styles.primaryIconShell, { backgroundColor: `${tokens.accent}12` }]}>
            <Ionicons color={tokens.accent} name={action.icon} size={18} />
          </View>
        </View>

        <View style={styles.primaryCopy}>
          <Text
            text={action.title}
            size="md"
            weight="bold"
            style={[styles.primaryTitle, { color: tokens.textPrimary }]}
          />
          <Text text={action.subtitle} size="xs" style={[styles.primarySubtitle, { color: tokens.textSecondary }]} />
        </View>

        <View
          style={[
            styles.primaryFooter,
            { backgroundColor: tokens.backgroundMuted, borderColor: `${tokens.accent}10` },
          ]}
        >
          <Text text={action.label} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
          <Ionicons color={tokens.accent} name="arrow-forward-outline" size={16} />
        </View>
      </SurfaceCard>
    </Pressable>
  )
}

export function HomeCockpitMiniCard({
  icon,
  label,
  onPress,
  title,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  title: string
  tone: string
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.miniPressable, pressed && styles.pressed]}>
      <SurfaceCard elevated style={styles.miniCard}>
        <View style={styles.miniHeader}>
          <View style={[styles.iconTile, { backgroundColor: `${tone}14` }]}>
            <Ionicons color={tone} name={icon} size={16} />
          </View>
          <Ionicons color={tone} name="arrow-forward-outline" size={14} />
        </View>
        <Text text={title} size="xxs" weight="semiBold" style={{ color: tokens.textPrimary }} />
        <Text text={label} size="xxs" style={[styles.miniLabel, { color: tokens.textSecondary }]} />
      </SurfaceCard>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  iconTile: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  miniCard: {
    gap: 12,
    minHeight: 132,
    paddingBottom: 14,
    paddingTop: 14,
  },
  miniHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniLabel: {
    lineHeight: 18,
  },
  miniPressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryCard: {
    gap: 18,
  },
  primaryCopy: {
    gap: 8,
  },
  primaryFooter: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryIconShell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  primarySubtitle: {
    lineHeight: 20,
  },
  primaryTitle: {
    lineHeight: 26,
  },
})
