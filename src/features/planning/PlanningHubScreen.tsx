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
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Pressable } from "react-native"

import {
  AppSegmentedControl,
  Text,
  useDesignTokens,
} from "@/ui"
import { MotionView } from "@/ui/composites"
import { translate } from "@/i18n/translate"

import { PlanningShiftsScreen } from "./PlanningShiftsScreen"
import { PlanningTodosScreen } from "./PlanningTodosScreen"
import { PlanningCallsScreen } from "./PlanningCallsScreen"
import { PlanningRequestsScreen } from "./PlanningRequestsScreen"
import { PlanningLeaveScreen } from "./PlanningLeaveScreen"

type PlanningTab = "shifts" | "todos" | "calls" | "requests" | "leave"

function getTabOptions(): Array<{ label: string; value: PlanningTab }> {
  return [
    { label: translate("planning:sections.tabs.shifts"), value: "shifts" },
    { label: translate("planning:sections.tabs.todos"), value: "todos" },
    { label: translate("planning:sections.tabs.calls"), value: "calls" },
    { label: translate("planning:sections.tabs.requests"), value: "requests" },
    { label: translate("planning:sections.tabs.leave"), value: "leave" },
  ]
}

export function PlanningHubScreen() {
  const tokens = useDesignTokens()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PlanningTab>("shifts")

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
        </MotionView>

        {/* Five-segment control */}
        <MotionView delay={60} style={styles.segmentWrapper}>
          <AppSegmentedControl
            onChange={setActiveTab}
            options={getTabOptions()}
            value={activeTab}
          />
        </MotionView>
      </View>

      {/* Tab content — keep all mounted for instant tab switch */}
      <View style={[styles.tabPane, { display: activeTab === "shifts" ? "flex" : "none" }]}>
        <PlanningShiftsScreen />
      </View>
      <View style={[styles.tabPane, { display: activeTab === "todos" ? "flex" : "none" }]}>
        <PlanningTodosScreen />
      </View>
      <View style={[styles.tabPane, { display: activeTab === "calls" ? "flex" : "none" }]}>
        <PlanningCallsScreen />
      </View>
      <View style={[styles.tabPane, { display: activeTab === "requests" ? "flex" : "none" }]}>
        <PlanningRequestsScreen />
      </View>
      <View style={[styles.tabPane, { display: activeTab === "leave" ? "flex" : "none" }]}>
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
  tabPane: {
    flex: 1,
  },
})
