import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import {
  PlanningLeaveBalanceCard,
  PlanningLeaveBalanceEmpty,
  PlanningLeaveRequestsSection,
  PlanningNewLeaveCard,
} from "./PlanningLeaveSections"
import { usePlanningLeaveScreen } from "./usePlanningLeaveScreen"

export function PlanningLeaveScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningLeaveScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError && screen.balances.length === 0 && screen.requests.length === 0) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageHeader delay={0} title="Verlof" />
        <EmptyState
          actionLabel="Opnieuw proberen"
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle="Kon je verlofgegevens niet laden. Controleer je verbinding en probeer opnieuw."
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
      <PageHeader delay={0} title="Verlof" />

      {screen.currentYearBalance ? (
        <PlanningLeaveBalanceCard balance={screen.currentYearBalance} />
      ) : !screen.isLoading ? (
        <PlanningLeaveBalanceEmpty />
      ) : null}

      <PlanningNewLeaveCard
        createError={screen.createError}
        createSuccess={screen.createSuccess}
        endDate={screen.form.endDate}
        isCreating={screen.isCreating}
        notes={screen.form.notes}
        onDismissSuccess={screen.dismissSuccess}
        onSubmit={() => { void screen.handleCreateLeave() }}
        setEndDate={(v) => screen.setForm((f) => ({ ...f, endDate: v }))}
        setNotes={(v) => screen.setForm((f) => ({ ...f, notes: v }))}
        setStartDate={(v) => screen.setForm((f) => ({ ...f, startDate: v }))}
        startDate={screen.form.startDate}
      />

      <PlanningLeaveRequestsSection requests={screen.requests} />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
