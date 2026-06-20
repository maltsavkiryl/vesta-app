import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, MotionView, PageHeader, Skeleton, SurfaceCard, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import {
  PlanningLeaveBalanceCard,
  PlanningLeaveBalanceEmpty,
} from "./PlanningLeaveSections"
import { usePlanningLeaveScreen } from "./usePlanningLeaveScreen"

function LeaveBalanceSkeleton() {
  const tokens = useDesignTokens()
  return (
    <SurfaceCard style={styles.skeletonCard}>
      <Skeleton height={12} width={120} radius={6} />
      <Skeleton height={52} width={80} radius={tokens.radiusMd} />
      <View style={styles.skeletonGrid}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={32} width="48%" radius={tokens.radiusSm} />
        ))}
      </View>
    </SurfaceCard>
  )
}

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

  const isFirstLoad = screen.isLoading && !screen.entitlement

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <PageHeader delay={0} title={translate("planning:leave.title")} />

      {isFirstLoad ? (
        <LeaveBalanceSkeleton />
      ) : screen.entitlement ? (
        <MotionView delay={60}>
          <PlanningLeaveBalanceCard entitlement={screen.entitlement} />
        </MotionView>
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
  skeletonCard: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
})
