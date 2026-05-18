import { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

export function SectionTitle({
  actionIcon,
  actionLabel,
  badgeLabel,
  onAction,
  onPress,
  title,
  trailing,
  titleSize = "md",
}: {
  actionIcon?: ReactNode
  actionLabel?: string
  badgeLabel?: string
  onAction?: () => void
  onPress?: () => void
  title: string
  trailing?: ReactNode
  titleSize?: "md" | "sm"
}) {
  const tokens = useDesignTokens()
  const actionHandler = onAction ?? onPress
  const textSize = titleSize === "sm" ? "sm" : "md"

  return (
    <View style={styles.sectionHeader}>
      <Text text={title} size={textSize} weight="semiBold" style={{ color: tokens.textPrimary }} />
      <View style={styles.sectionHeaderActions}>
        {badgeLabel ? (
          <View style={[styles.sectionBadge, { backgroundColor: `${tokens.danger}14` }]}>
            <Text text={badgeLabel} size="xxs" weight="semiBold" style={{ color: tokens.danger }} />
          </View>
        ) : null}
        {actionLabel && actionHandler ? (
          <Pressable accessibilityRole="button" onPress={actionHandler} style={styles.inlineAction}>
            <Text text={actionLabel} size="xs" weight="medium" style={{ color: tokens.accent }} />
            {actionIcon}
          </Pressable>
        ) : null}
        {trailing}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inlineAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  sectionBadge: {
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionHeaderActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})
