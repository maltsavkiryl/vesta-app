import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
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
        <PageHeader delay={0} title="Open oproepen" />
        <EmptyState
          actionLabel="Opnieuw proberen"
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle="Kon de open oproepen niet laden. Controleer je verbinding en probeer opnieuw."
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
      <PageHeader delay={0} title="Open oproepen" />
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
