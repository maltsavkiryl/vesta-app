import { StyleSheet } from "react-native"

import { isToday } from "@/core/date"
import {
  ShiftActionNeededSection,
  ShiftChangeSummaryCallout,
  ShiftDeclinedSection,
  ShiftDetailEmptyState,
  ShiftDetailHero,
  ShiftManagerNoteSection,
  ShiftOpenTimeAction,
  ShiftPlanSection,
  ShiftRequestActions,
} from "@/features/schedule/ShiftDetailSections"
import { useShiftDetailScreen } from "@/features/schedule/useShiftDetailScreen"
import { AppScrollScreen, useDesignTokens } from "@/ui"

export function ShiftDetailScreen() {
  const tokens = useDesignTokens()
  const screen = useShiftDetailScreen()
  const changeSummaryCallout = screen.shift?.changeSummary ? (
    <ShiftChangeSummaryCallout summary={screen.shift.changeSummary} />
  ) : null

  if (!screen.shift) {
    return (
      <AppScrollScreen
        contentContainerStyle={styles.screen}
        style={{ backgroundColor: tokens.groupedBackground }}
      >
        <ShiftDetailEmptyState />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <ShiftDetailHero onOpenMaps={screen.handleOpenMaps} shift={screen.shift} />

      {screen.shift.requiresResponse ? (
        <ShiftActionNeededSection
          callout={changeSummaryCallout}
          onAcknowledge={screen.handleAcknowledgeUpdate}
          onDecline={screen.handleDeclineShift}
        />
      ) : screen.shift.responseStatus === "declined" ? (
        <>
          {changeSummaryCallout}
          <ShiftDeclinedSection />
        </>
      ) : (
        changeSummaryCallout
      )}

      <ShiftPlanSection shift={screen.shift} />

      {screen.shift.note ? <ShiftManagerNoteSection note={screen.shift.note} /> : null}

      <ShiftRequestActions shift={screen.shift} />

      {/* Derive "is this today" from the real date; fall back to the baked
          dayLabel only when a shift has no date. */}
      {(screen.shift.date ? isToday(screen.shift.date) : screen.shift.dayLabel === "Today") ? (
        <ShiftOpenTimeAction />
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
})
