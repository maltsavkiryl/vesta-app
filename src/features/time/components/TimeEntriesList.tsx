import { Pressable, StyleSheet, View } from "react-native"
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
      contentContainerStyle={styles.sheetContent}
      style={{ backgroundColor: tokens.background }}
      topInset="none"
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

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.entryButton,
        !isLast && {
          borderBottomColor: tokens.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <DateBadge label={weekday} value={day} variant="plain" />
      <View style={[styles.entryDivider, { backgroundColor: tokens.border }]} />
      <View style={styles.flex}>
        <Text
          text={getTimeEntryTimeRangeLabel(entry)}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${entry.shiftLabel} · ${getTimeEntryWorkedLabel(entry)}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={styles.entryStatus}>
        <Text
          text={
            showEarnings
              ? getTimeEntryEarningsLabel(entry)
              : entry.status === "approved"
                ? "Approved"
                : "Review"
          }
          size="xxs"
          weight="semiBold"
          style={{ color: showEarnings ? tokens.textPrimary : statusColor }}
        />
        <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  entriesCard: {
    borderRadius: 18,
  },
  entryButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: appLayout.rowGap,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  entryDivider: {
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  entryStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  sheetContent: {
    gap: appLayout.sheetGap,
    paddingBottom: appLayout.sheetPaddingBottom,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
})
