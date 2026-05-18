import { StyleSheet } from "react-native"

import { AppScrollScreen, appLayout } from "@/ui"

import { TimeEntriesListScreen, RecentEntries } from "./components/TimeEntriesList"
import { ActiveClockCard, IdleClockCard, TimeHeader } from "./components/TimeOverview"
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
      <TimeHeader status={state.clockSession.state} />

      {state.clockSession.state === "idle" ? (
        <IdleClockCard onClockIn={handleClockIn} />
      ) : (
        <ActiveClockCard
          breakSeconds={state.clockSession.state === "onBreak" ? snapshot.breakSeconds : 0}
          elapsedSeconds={elapsedSeconds}
          onClockOut={openClockOut}
          onEndBreak={handleEndBreak}
          onStartBreak={handleStartBreak}
          status={state.clockSession.state}
          totalBreakSeconds={totalBreakSeconds}
        />
      )}
      <RecentEntries
        entries={state.timeEntries}
        onOpenEntry={openEntry}
        onViewAll={openTimeEntries}
      />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: appLayout.cardGap,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
  },
})
