import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import { PlanningAgendaSection, PlanningShiftsEmpty } from "./PlanningShiftsSections"
import { usePlanningShiftsScreen } from "./usePlanningShiftsScreen"

export function PlanningShiftsScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningShiftsScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError && screen.shifts.length === 0) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageHeader delay={0} title="Mijn planning" />
        <EmptyState
          actionLabel="Opnieuw proberen"
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle="Kon je planning niet laden. Controleer je verbinding en probeer opnieuw."
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
      <PageHeader delay={0} title="Mijn planning" />
      {screen.agendaSections.length === 0 && !screen.isLoading ? (
        <PlanningShiftsEmpty />
      ) : (
        <PlanningAgendaSection
          onOpenShift={screen.handleOpenShift}
          sections={screen.agendaSections}
        />
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
