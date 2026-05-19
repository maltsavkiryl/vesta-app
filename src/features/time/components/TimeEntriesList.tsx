import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"

import { parseDateValue } from "@/core/date"
import type { TimeEntry } from "@/core/models"
import {
  getTimeEntryEarningsLabel,
  getTimeEntryTimeRangeLabel,
  getTimeEntryWorkedLabel,
} from "@/core/timeEntries"
import {
  AppScrollScreen,
  DateBadge,
  ListCard,
  ListCardItem,
  SectionBlock,
  Text,
  appLayout,
  useDesignTokens,
} from "@/ui"

export function RecentEntries({
  entries,
  onOpenEntry,
  onViewAll,
}: {
  entries: TimeEntry[]
  onOpenEntry: (entry: TimeEntry) => void
  onViewAll: () => void
}) {
  return (
    <SectionBlock title="Recent entries" actionLabel="View all" onAction={onViewAll}>
      <ListCard style={styles.entriesCard}>
        {entries.slice(0, 4).map((entry, index, items) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            isLast={index === items.length - 1}
            onPress={() => onOpenEntry(entry)}
          />
        ))}
      </ListCard>
    </SectionBlock>
  )
}

export function TimeEntriesListScreen({
  groupedEntries,
  onOpenEntry,
  totalEntries,
}: {
  groupedEntries: Record<string, TimeEntry[]>
  onOpenEntry: (entry: TimeEntry) => void
  totalEntries: number
}) {
  const tokens = useDesignTokens()

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
      variant="grouped"
    >
      <Text
        text={`${totalEntries} entries total`}
        size="xs"
        style={{ color: tokens.textSecondary }}
      />
      {Object.entries(groupedEntries).map(([month, monthEntries]) => (
        <SectionBlock
          key={month}
          title={month}
          trailing={
            <Text
              text={`${monthEntries.length} shifts`}
              size="xxs"
              style={{ color: tokens.textMuted }}
            />
          }
        >
          <ListCard style={styles.entriesCard}>
            {monthEntries.map((entry, index) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                isLast={index === monthEntries.length - 1}
                onPress={() => onOpenEntry(entry)}
                showEarnings
              />
            ))}
          </ListCard>
        </SectionBlock>
      ))}
    </AppScrollScreen>
  )
}

function EntryRow({
  entry,
  isLast,
  onPress,
  showEarnings,
}: {
  entry: TimeEntry
  isLast?: boolean
  onPress: () => void
  showEarnings?: boolean
}) {
  const tokens = useDesignTokens()
  const date = parseDateValue(entry.clockInAt)
  const weekday = date ? format(date, "EEE") : "--"
  const day = date ? format(date, "d") : "--"
  const statusColor = entry.status === "approved" ? tokens.success : tokens.warning
  const trailingLabel = showEarnings
    ? getTimeEntryEarningsLabel(entry)
    : entry.status === "approved"
      ? "Approved"
      : "Review"
  const trailingTone = showEarnings ? tokens.textPrimary : statusColor

  return (
    <ListCardItem
      isLast={isLast}
      leading={<DateBadge label={weekday} value={day} variant="plain" />}
      onPress={onPress}
      subtitle={`${entry.shiftLabel} · ${getTimeEntryWorkedLabel(entry)}`}
      subtitleStyle={{ color: tokens.textSecondary }}
      title={getTimeEntryTimeRangeLabel(entry)}
      titleStyle={{ color: tokens.textPrimary }}
      trailing={
        <View style={styles.entryStatus}>
          <Text text={trailingLabel} size="xs" weight="semiBold" style={{ color: trailingTone }} />
          <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  entriesCard: {
    borderRadius: 20,
  },
  entryStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  screen: {
    gap: appLayout.screenGap,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
  },
})
