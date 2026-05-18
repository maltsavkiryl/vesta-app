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
import { AppScrollScreen, SectionTitle, Text, appLayout, useDesignTokens } from "@/ui"

export function RecentEntries({
  entries,
  onOpenEntry,
  onViewAll,
}: {
  entries: TimeEntry[]
  onOpenEntry: (entry: TimeEntry) => void
  onViewAll: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.entriesSection}>
      <SectionTitle
        actionIcon={
          <Ionicons color={tokens.textSecondary} name="chevron-forward-outline" size={13} />
        }
        actionLabel="View all"
        onAction={onViewAll}
        title="Recent entries"
        titleSize="sm"
      />
      <View
        style={[
          styles.entriesCard,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        {entries.slice(0, 4).map((entry) => (
          <EntryRow key={entry.id} entry={entry} onPress={() => onOpenEntry(entry)} />
        ))}
      </View>
    </View>
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
      contentInsetAdjustmentBehavior="never"
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
        <View key={month} style={styles.monthGroup}>
          <View style={styles.monthHeader}>
            <Text
              text={month}
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.textSecondary }}
            />
            <Text
              text={`${monthEntries.length} shifts`}
              size="xxs"
              style={{ color: tokens.textMuted }}
            />
          </View>
          <View
            style={[
              styles.entriesCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            {monthEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onPress={() => onOpenEntry(entry)}
                showEarnings
              />
            ))}
          </View>
        </View>
      ))}
    </AppScrollScreen>
  )
}

function EntryRow({
  entry,
  onPress,
  showEarnings,
}: {
  entry: TimeEntry
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
        { borderBottomColor: tokens.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <View style={styles.entryDate}>
        <Text
          text={weekday}
          size="xxs"
          style={[styles.entryWeekday, { color: tokens.textMuted }]}
        />
        <Text
          text={day}
          weight="semiBold"
          style={[styles.entryDay, { color: tokens.textPrimary }]}
        />
      </View>
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
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  entriesSection: {
    gap: 8,
  },
  entryButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: appLayout.rowGap,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  entryDate: {
    alignItems: "center",
    width: 36,
  },
  entryDay: {
    fontSize: 18,
    lineHeight: 21,
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
  entryWeekday: {
    fontSize: 10,
  },
  flex: {
    flex: 1,
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingLeft: 2,
  },
  sheetContent: {
    gap: appLayout.sheetGap,
    paddingBottom: appLayout.sheetPaddingBottom,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
})
