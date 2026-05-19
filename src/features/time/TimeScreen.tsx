import { StyleSheet } from "react-native"

import { AppScrollScreen, MotionView, appLayout } from "@/ui"

import { TimeEntriesListScreen, RecentEntries } from "./components/TimeEntriesList"
import { TimeHeader, TimeOverviewCard } from "./components/TimeOverview"
import { useTimeEntriesScreen } from "./useTimeEntriesScreen"
import { useTimeScreen } from "./useTimeScreen"

export function TimeEntriesScreen() {
  const { groupedEntries, openEntry, state } = useTimeEntriesScreen()

  return (
    <TimeEntriesListScreen
      groupedEntries={groupedEntries}
      onOpenEntry={openEntry}
      totalEntries={state.timeEntries.length}
    />
  )
}

export function TimeScreen() {
  const {
    elapsedSeconds,
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
    openClockOut,
    openEntry,
    openTimeEntries,
    snapshot,
    state,
    totalBreakSeconds,
  } = useTimeScreen()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <TimeHeader delay={0} status={state.clockSession.state} />

      <MotionView delay={55}>
        <TimeOverviewCard
          controller={{
            elapsedSeconds,
            handleClockIn,
            handleEndBreak,
            handleStartBreak,
            openClockOut,
            snapshot,
            state,
            totalBreakSeconds,
          }}
        />
      </MotionView>
      <MotionView delay={110}>
        <RecentEntries
          entries={state.timeEntries}
          onOpenEntry={openEntry}
          onViewAll={openTimeEntries}
        />
      </MotionView>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: appLayout.cardGap,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
  },
})
