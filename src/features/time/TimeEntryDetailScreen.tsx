import { StyleSheet } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"

import {
  AppScrollScreen,
  useDesignTokens,
} from "@/ui"
import { formatShortDate } from "@/core/date"
import {
  TimeEntryBreaksSection,
  TimeEntryDetailEmptyState,
  TimeEntryHero,
  TimeEntryMapSection,
  TimeEntryPhotoSection,
  TimeEntrySummarySection,
  TimeEntryTimelineSection,
} from "@/features/time/TimeEntryDetailSections"
import { useTimeEntryDetailScreen } from "@/features/time/useTimeEntryDetailScreen"

export function TimeEntryDetailScreen() {
  const tokens = useDesignTokens()
  const { id } = useLocalSearchParams<{ id: string }>()
  const screen = useTimeEntryDetailScreen()

  if (!screen.entry) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <Stack.Screen options={{ title: "Entry details" }} />
        <TimeEntryDetailEmptyState />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: formatShortDate(screen.entry.clockInAt) }} />

      <TimeEntryHero
        entry={screen.entry}
        primaryLocationLabel={screen.primaryLocation?.addressLabel}
      />
      <TimeEntrySummarySection entry={screen.entry} />
      {screen.mapRegion ? (
        <TimeEntryMapSection events={screen.sortedEvents} mapRegion={screen.mapRegion} />
      ) : null}
      {screen.entry.clockInProofPhoto ? (
        <TimeEntryPhotoSection
          capturedAt={screen.entry.clockInProofPhoto.capturedAt}
          uri={screen.entry.clockInProofPhoto.uri}
        />
      ) : null}
      {screen.breakSegments.length > 0 ? (
        <TimeEntryBreaksSection breakSegments={screen.breakSegments} />
      ) : null}
      <TimeEntryTimelineSection events={screen.sortedEvents} />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 16,
    paddingHorizontal: 16,
  },
})
