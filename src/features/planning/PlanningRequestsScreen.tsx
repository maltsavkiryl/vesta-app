import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
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
        <PageHeader delay={0} title={translate("planning:requests.title")} />
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
      <PageHeader delay={0} title={translate("planning:requests.title")} />

      <PlanningRequestShortcuts
        onNewChangeRequest={screen.handleNewChangeRequest}
        onNewShiftSwap={screen.handleNewShiftSwap}
      />

      <PlanningRequestsListSection
        myEmployeeId={screen.myEmployeeId}
        onCancel={screen.handleCancelSwap}
        onDecide={screen.handleDecideSwap}
        requests={screen.requests}
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
