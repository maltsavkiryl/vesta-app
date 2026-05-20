/* eslint-disable react-native/no-inline-styles */

import { StyleSheet } from "react-native"

import {
  AppScrollScreen,
  useDesignTokens,
} from "@/ui"
import {
  ShiftActionNeededSection,
  ShiftChangeSummaryCallout,
  ShiftDetailEmptyState,
  ShiftDetailHero,
  ShiftManagerNoteSection,
  ShiftOpenTimeAction,
  ShiftPlanSection,
  ShiftRequestActions,
} from "@/features/schedule/ShiftDetailSections"
import { useShiftDetailScreen } from "@/features/schedule/useShiftDetailScreen"

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
        />
      ) : (
        changeSummaryCallout
      )}

      <ShiftPlanSection shift={screen.shift} />

      {screen.shift.note ? (
        <ShiftManagerNoteSection note={screen.shift.note} />
      ) : null}

      <ShiftRequestActions shift={screen.shift} />

      {screen.shift.dayLabel === "Today" ? (
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
