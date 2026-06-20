/**
 * PlanningHubScreen — the "Planning" tab root.
 *
 * Provides a segmented control to switch between:
 *   Shifts | Todos | Calls | Requests | Leave
 *
 * Each segment lazily renders its sub-screen. Availability editing is
 * accessible via the quick-actions button (gear icon) and routes to the
 * existing /(app)/availability/* stack screens.
 */
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useCalendarSync } from "@/features/calendar/useCalendarSync"
import { translate } from "@/i18n/translate"
import { AppSegmentedControl, Text, useDesignTokens } from "@/ui"
import { MotionView } from "@/ui/composites"

import { usePlanningCallsQuery } from "./data/planning.queries"
import { PlanningCallsScreen } from "./PlanningCallsScreen"
import { PlanningLeaveScreen } from "./PlanningLeaveScreen"
import { PlanningRequestsScreen } from "./PlanningRequestsScreen"
import { PlanningShiftsScreen } from "./PlanningShiftsScreen"
import { PlanningTodosScreen } from "./PlanningTodosScreen"

type PlanningTab = "shifts" | "todos" | "calls" | "requests" | "leave"

// Surfaces the number of open shifts the employee can pick up directly on the
// Calls segment, so the earning opportunity is visible without opening the tab.
function getTabOptions(openShiftCount: number): Array<{ label: string; value: PlanningTab }> {
  const callsLabel = translate("planning:sections.tabs.calls")
  return [
    { label: translate("planning:sections.tabs.shifts"), value: "shifts" },
    { label: translate("planning:sections.tabs.todos"), value: "todos" },
    {
      label: openShiftCount > 0 ? `${callsLabel} (${openShiftCount})` : callsLabel,
      value: "calls",
    },
    { label: translate("planning:sections.tabs.requests"), value: "requests" },
    { label: translate("planning:sections.tabs.leave"), value: "leave" },
  ]
}

export function PlanningHubScreen() {
  const tokens = useDesignTokens()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PlanningTab>("shifts")
  const { state: openCalls } = usePlanningCallsQuery()
  const openShiftCount = openCalls?.length ?? 0
  const { isSyncing, syncToCalendar } = useCalendarSync()

  const handleOpenAvailabilityTemplate = () => {
    router.push("/(app)/availability-template" as never)
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.groupedBackground }]}>
      {/* Sticky header row with segmented control */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tokens.groupedBackground,
            borderBottomColor: tokens.separator,
          },
        ]}
      >
        <MotionView delay={0} style={styles.headerTop}>
          <Text
            preset="heading"
            style={[styles.headerTitle, { color: tokens.textPrimary }]}
            text={translate("planning:title")}
            weight="bold"
          />
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Add my shifts to my phone calendar"
              accessibilityRole="button"
              disabled={isSyncing}
              onPress={() => {
                void syncToCalendar()
              }}
              style={({ pressed }) => [
                styles.availabilityButton,
                {
                  backgroundColor: pressed ? tokens.backgroundMuted : tokens.accentMuted,
                  opacity: pressed || isSyncing ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons color={tokens.accent} name="download-outline" size={17} />
            </Pressable>
            <Pressable
              accessibilityLabel={translate("planning:availability.editAccessibilityLabel")}
              accessibilityRole="button"
              onPress={handleOpenAvailabilityTemplate}
              style={({ pressed }) => [
                styles.availabilityButton,
                {
                  backgroundColor: pressed ? tokens.backgroundMuted : tokens.accentMuted,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons color={tokens.accent} name="calendar-outline" size={17} />
            </Pressable>
          </View>
        </MotionView>

        {/* Five-segment control */}
        <MotionView delay={60} style={styles.segmentWrapper}>
          <AppSegmentedControl
            onChange={setActiveTab}
            options={getTabOptions(openShiftCount)}
            value={activeTab}
          />
        </MotionView>
      </View>

      {/* Tab content — keep all mounted for instant tab switch */}
      <View style={[styles.tabPane, activeTab === "shifts" ? styles.tabVisible : styles.tabHidden]}>
        <PlanningShiftsScreen />
      </View>
      <View style={[styles.tabPane, activeTab === "todos" ? styles.tabVisible : styles.tabHidden]}>
        <PlanningTodosScreen />
      </View>
      <View style={[styles.tabPane, activeTab === "calls" ? styles.tabVisible : styles.tabHidden]}>
        <PlanningCallsScreen />
      </View>
      <View
        style={[styles.tabPane, activeTab === "requests" ? styles.tabVisible : styles.tabHidden]}
      >
        <PlanningRequestsScreen />
      </View>
      <View style={[styles.tabPane, activeTab === "leave" ? styles.tabVisible : styles.tabHidden]}>
        <PlanningLeaveScreen />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  availabilityButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
    paddingBottom: 10,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: 0,
    lineHeight: 32,
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  segmentWrapper: {
    // full-width
  },
  tabHidden: {
    display: "none",
  },
  tabPane: {
    flex: 1,
  },
  tabVisible: {
    display: "flex",
  },
})
