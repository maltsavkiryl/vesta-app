import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns/format"
import Animated from "react-native-reanimated"

import { parseDateValue } from "@/core/date"
import type { TimeEntry } from "@/core/models"
import { getTimeEntryTimeRangeLabel, getTimeEntryWorkedLabel } from "@/core/timeEntries"
import { translate } from "@/i18n/translate"
import {
  AppScrollScreen,
  DateBadge,
  EmptyState,
  ListCard,
  ListCardItem,
  SectionBlock,
  Text,
  appLayout,
  useDesignTokens,
} from "@/ui"
import { useListItemEntrance } from "@/ui/foundations/motion"

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
    <SectionBlock
      title={translate("time:recentEntries")}
      actionLabel={translate("time:viewAll")}
      onAction={onViewAll}
    >
      {entries.length > 0 ? (
        <ListCard style={styles.entriesCard}>
          {entries.slice(0, 4).map((entry, index, items) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              index={index}
              isLast={index === items.length - 1}
              onPress={() => onOpenEntry(entry)}
            />
          ))}
        </ListCard>
      ) : (
        <EmptyState
          icon={<Ionicons color={tokens.textMuted} name="time-outline" size={18} />}
          subtitle={translate("time:noEntriesSubtitle")}
          title={translate("time:noEntriesTitle")}
        />
      )}
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
  const months = Object.entries(groupedEntries)

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
      variant="grouped"
    >
      {totalEntries === 0 ? (
        <EmptyState
          cardless
          icon={<Ionicons color={tokens.textMuted} name="time-outline" size={18} />}
          subtitle={translate("time:historyEmptySubtitle")}
          title={translate("time:historyEmptyTitle")}
        />
      ) : (
        <>
          <Text
            text={translate("time:entriesTotal", { count: totalEntries })}
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
          {months.map(([month, monthEntries]) => (
            <SectionBlock
              key={month}
              title={month}
              trailing={
                <Text
                  text={translate("time:monthEntries", { count: monthEntries.length })}
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
                    index={index}
                    isLast={index === monthEntries.length - 1}
                    onPress={() => onOpenEntry(entry)}
                  />
                ))}
              </ListCard>
            </SectionBlock>
          ))}
        </>
      )}
    </AppScrollScreen>
  )
}

function EntryRow({
  entry,
  index = 0,
  isLast,
  onPress,
}: {
  entry: TimeEntry
  index?: number
  isLast?: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 0, step: 35 })
  const date = parseDateValue(entry.clockInAt)
  const weekday = date ? format(date, "EEE") : "--"
  const day = date ? format(date, "d") : "--"
  const statusColor = entry.status === "approved" ? tokens.success : tokens.warning
  const trailingLabel =
    entry.status === "approved"
      ? translate("time:entryDetail.approved")
      : translate("time:entryDetail.review")
  const trailingTone = statusColor

  return (
    <Animated.View style={entranceStyle}>
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
            <Text
              text={trailingLabel}
              size="xs"
              weight="semiBold"
              style={{ color: trailingTone }}
            />
            <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
          </View>
        }
      />
    </Animated.View>
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
