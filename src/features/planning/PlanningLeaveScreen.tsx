import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import {
  PlanningLeaveBalanceCard,
  PlanningLeaveBalanceEmpty,
} from "./PlanningLeaveSections"
import { usePlanningLeaveScreen } from "./usePlanningLeaveScreen"

export function PlanningLeaveScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningLeaveScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError && !screen.entitlement) {
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

      {screen.entitlement ? (
        <PlanningLeaveBalanceCard entitlement={screen.entitlement} />
      ) : !screen.isLoading ? (
        <PlanningLeaveBalanceEmpty />
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
