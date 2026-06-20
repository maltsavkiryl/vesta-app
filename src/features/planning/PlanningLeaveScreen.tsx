import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
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
        <PageHeader delay={0} title={translate("planning:leave.title")} />
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
      <PageHeader delay={0} title={translate("planning:leave.title")} />

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
