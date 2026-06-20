import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
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
        <PageHeader delay={0} title={translate("planning:sections.mySchedule")} />
        <EmptyState
          actionLabel={translate("common:actions.retry")}
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle={translate("planning:schedule.loadErrorSubtitle")}
          title={translate("planning:schedule.loadError")}
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
      <PageHeader delay={0} title={translate("planning:sections.mySchedule")} />
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
