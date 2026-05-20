import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { ListCard, ListCardItem } from "@/ui"
import { Pill, ProgressBar, SectionBlock, SurfaceCard, Text, useDesignTokens } from "@/ui"

import type { ProfileOverviewRow } from "./profileOverviewRows"
import type { ProfileSetupStatus } from "./profileSetupStatus"

export function ProfileCompletenessCard({ setupStatus }: { setupStatus: ProfileSetupStatus }) {
  const tokens = useDesignTokens()
  const badgeLabel =
    setupStatus.remainingCount === 0
      ? "Complete"
      : `${setupStatus.remainingCount} step${setupStatus.remainingCount === 1 ? "" : "s"} left`

  return (
    <SurfaceCard style={styles.completenessCard}>
      <View style={styles.progressHeader}>
        <View style={styles.headerCopy}>
          <Text
            text={setupStatus.title}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text text={setupStatus.detail} size="xxs" style={{ color: tokens.textMuted }} />
        </View>
        <Pill label={badgeLabel} tone={setupStatus.remainingCount === 0 ? "success" : "accent"} />
      </View>
      <ProgressBar progress={setupStatus.progress} />
    </SurfaceCard>
  )
}

export function ProfileOverviewSectionCard({
  items,
  title,
}: {
  items: ProfileOverviewRow[]
  title: string
}) {
  return (
    <SectionBlock title={title}>
      <ListCard>
        {items.map((item, index) => (
          <ProfileOverviewRowItem
            key={`${title}-${item.label}`}
            isLast={index === items.length - 1}
            item={item}
          />
        ))}
      </ListCard>
    </SectionBlock>
  )
}

export function ProfileVersionFooter({ label }: { label: string }) {
  const tokens = useDesignTokens()

  return <Text text={label} size="xxs" style={[styles.versionLabel, { color: tokens.textMuted }]} />
}

function ProfileOverviewRowItem({ isLast, item }: { isLast: boolean; item: ProfileOverviewRow }) {
  const router = useRouter()
  const tokens = useDesignTokens()
  const canPress = Boolean(item.route || item.onPress)
  const trailing =
    item.rightAccessory ??
    (item.badge ? (
      <View style={styles.rowTrailing}>
        <Pill label={item.badge} tone={item.badgeTone ?? "accent"} />
        {item.showChevron !== false && canPress ? (
          <Ionicons color={tokens.textMuted} name="chevron-forward" size={15} />
        ) : null}
      </View>
    ) : item.showChevron !== false && canPress ? (
      <Ionicons color={tokens.textMuted} name="chevron-forward" size={15} />
    ) : null)

  const handlePress = () => {
    if (item.onPress) {
      item.onPress()
      return
    }

    if (item.route) {
      router.push(item.route)
    }
  }

  return (
    <ListCardItem
      isLast={isLast}
      subtitle={item.value}
      subtitleStyle={{ color: item.destructive ? tokens.danger : tokens.textSecondary }}
      title={item.label}
      titleStyle={{ color: item.destructive ? tokens.danger : tokens.textPrimary }}
      onPress={canPress ? handlePress : undefined}
      leading={
        <Ionicons
          color={item.destructive ? tokens.danger : tokens.textSecondary}
          name={item.icon}
          size={17}
          style={styles.rowIcon}
        />
      }
      trailing={trailing}
    />
  )
}

const styles = StyleSheet.create({
  completenessCard: {
    borderRadius: 16,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  progressHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowIcon: {
    width: 17,
  },
  rowTrailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  versionLabel: {
    marginBottom: 4,
    textAlign: "center",
  },
})
