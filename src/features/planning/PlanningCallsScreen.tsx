import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import { PlanningCallCard, PlanningCallsEmpty } from "./PlanningCallsSections"
import { usePlanningCallsScreen } from "./usePlanningCallsScreen"

export function PlanningCallsScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningCallsScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError && screen.calls.length === 0) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageHeader delay={0} title={translate("planning:calls.title")} />
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
      <PageHeader delay={0} title={translate("planning:calls.title")} />
      {screen.calls.length === 0 && !screen.isLoading ? (
        <PlanningCallsEmpty />
      ) : (
        <View style={styles.callsList}>
          {screen.calls.map((call) => (
            <PlanningCallCard
              key={call.id}
              call={call}
              claimState={screen.claimStates[call.id] ?? "idle"}
              onClaim={() => {
                void screen.handleClaim(call.id, call.employerCode, call.establishmentCode)
              }}
            />
          ))}
        </View>
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  callsList: {
    gap: 14,
  },
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
