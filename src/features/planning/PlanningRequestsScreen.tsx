import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useToast } from "@/ui/feedback"
import { translate } from "@/i18n/translate"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import {
  PlanningRequestShortcuts,
  PlanningRequestsListSection,
  PlanningRequestsSkeleton,
} from "./PlanningRequestsSections"
import { usePlanningRequestsScreen } from "./usePlanningRequestsScreen"

export function PlanningRequestsScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningRequestsScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)
  const { showSuccess } = useToast()

  const handleDecideSwap = async (swapCode: string, accept: boolean) => {
    await screen.handleDecideSwap(swapCode, accept)
    showSuccess(translate("planning:requests.swapDecided"))
  }

  const handleCancelSwap = async (swapCode: string) => {
    await screen.handleCancelSwap(swapCode)
    showSuccess(translate("planning:requests.swapCancelled"))
  }

  const isFirstLoad =
    screen.isLoading &&
    screen.requests.swapRequests.length === 0 &&
    screen.requests.changeRequests.length === 0

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

      {isFirstLoad ? (
        <PlanningRequestsSkeleton />
      ) : (
        <PlanningRequestsListSection
          myEmployeeId={screen.myEmployeeId}
          onCancel={handleCancelSwap}
          onDecide={handleDecideSwap}
          requests={screen.requests}
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
