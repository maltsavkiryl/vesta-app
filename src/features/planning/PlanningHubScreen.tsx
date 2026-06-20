/**
 * PlanningHubScreen — the "Planning" tab root.
 *
 * Provides a segmented control to switch between:
 *   Shifts | Taken | Oproepen | Aanvragen | Verlof
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
  AppScrollScreen,
  AppSegmentedControl,
  PageHeader,
  Text,
  useDesignTokens,
} from "@/ui"

import { PlanningShiftsScreen } from "./PlanningShiftsScreen"
import { PlanningTodosScreen } from "./PlanningTodosScreen"
import { PlanningCallsScreen } from "./PlanningCallsScreen"
import { PlanningRequestsScreen } from "./PlanningRequestsScreen"
import { PlanningLeaveScreen } from "./PlanningLeaveScreen"

type PlanningTab = "shifts" | "todos" | "calls" | "requests" | "leave"

const TAB_OPTIONS: Array<{ label: string; value: PlanningTab }> = [
  { label: "Planning", value: "shifts" },
  { label: "Taken", value: "todos" },
  { label: "Oproepen", value: "calls" },
  { label: "Aanvragen", value: "requests" },
  { label: "Verlof", value: "leave" },
]

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
      <View style={[styles.header, { backgroundColor: tokens.groupedBackground, borderBottomColor: tokens.separator }]}>
        <View style={styles.headerTop}>
          <Text
            preset="heading"
            style={[styles.headerTitle, { color: tokens.textPrimary }]}
            text="Mijn planning"
            weight="bold"
          />
          <Pressable
            accessibilityLabel="Beschikbaarheid bewerken"
            accessibilityRole="button"
            onPress={handleOpenAvailabilityTemplate}
            style={({ pressed }) => [
              styles.availabilityButton,
              { backgroundColor: tokens.backgroundMuted, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons color={tokens.textSecondary} name="calendar-outline" size={17} />
          </Pressable>
        </View>

        {/* Five-segment control — use a horizontal scroll if needed on small screens */}
        <View style={styles.segmentWrapper}>
          <AppSegmentedControl
            onChange={setActiveTab}
            options={TAB_OPTIONS}
            value={activeTab}
          />
        </View>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === "shifts" && <PlanningShiftsScreen />}
        {activeTab === "todos" && <PlanningTodosScreen />}
        {activeTab === "calls" && <PlanningCallsScreen />}
        {activeTab === "requests" && <PlanningRequestsScreen />}
        {activeTab === "leave" && <PlanningLeaveScreen />}
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
  content: {
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
    // Full-width segmented control
  },
})
