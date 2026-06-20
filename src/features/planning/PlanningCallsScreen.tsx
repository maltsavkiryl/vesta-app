import { useEffect, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useToast } from "@/ui/feedback"
import { useRefreshHandler } from "@/utils/useRefreshHandler"

import {
  PlanningCallCard,
  PlanningCallsEmpty,
  PlanningCallsListSkeleton,
} from "./PlanningCallsSections"
import { usePlanningCallsScreen } from "./usePlanningCallsScreen"

export function PlanningCallsScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningCallsScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)
  const { showSuccess } = useToast()

  // Show a success toast the first time a call transitions to "claimed"
  const previousClaimStatesRef = useRef<Record<string, string>>({})
  useEffect(() => {
    const prev = previousClaimStatesRef.current
    for (const [callId, state] of Object.entries(screen.claimStates)) {
      if (state === "claimed" && prev[callId] !== "claimed") {
        showSuccess(translate("planning:calls.claimSuccess"))
        break
      }
    }
    previousClaimStatesRef.current = { ...screen.claimStates }
  }, [screen.claimStates, showSuccess])

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

  const isFirstLoad = screen.isLoading && screen.calls.length === 0

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <PageHeader delay={0} title={translate("planning:calls.title")} />
      {isFirstLoad ? (
        <PlanningCallsListSkeleton />
      ) : screen.calls.length === 0 ? (
        <PlanningCallsEmpty />
      ) : (
        <View style={styles.callsList}>
          {screen.calls.map((call, i) => (
            <PlanningCallCard
              key={call.id}
              call={call}
              claimState={screen.claimStates[call.id] ?? "idle"}
              index={i}
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
