import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import {
  PlanningRequestShortcuts,
  PlanningRequestsListSection,
} from "./PlanningRequestsSections"
import { usePlanningRequestsScreen } from "./usePlanningRequestsScreen"

export function PlanningRequestsScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningRequestsScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageHeader delay={0} title="Mijn aanvragen" />
        <EmptyState
          actionLabel="Opnieuw proberen"
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle="Kon je aanvragen niet laden. Controleer je verbinding en probeer opnieuw."
          title="Er is iets misgegaan"
        />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <PageHeader delay={0} title="Mijn aanvragen" />

      <PlanningRequestShortcuts
        onNewChangeRequest={screen.handleNewChangeRequest}
        onNewShiftSwap={screen.handleNewShiftSwap}
      />

      <PlanningRequestsListSection
        leaveRequests={screen.leaveRequests}
        scheduleRequests={screen.scheduleRequests}
      />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
