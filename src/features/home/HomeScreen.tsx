import { StyleSheet, View } from "react-native"

import { HomeHeader } from "@/features/home/components/HomeHeader"
import { HomeScreenSkeleton } from "@/features/home/components/HomeScreenSkeleton"
import {
  HomeTasksDrawerGroups,
  HomeTasksSection,
  HomeUpdatesSection,
} from "@/features/home/components/HomeTaskSections"
import { HomeTimeCard } from "@/features/home/components/HomeTimeCard"
import { PayrollProfileNudge } from "@/features/home/components/PayrollProfileNudge"
import { UpcomingShiftsSection } from "@/features/home/components/UpcomingShiftsSection"
import { useHomeScreen } from "@/features/home/useHomeScreen"
import { translate } from "@/i18n/translate"
import { AppScrollScreen, EmptyState, MotionView, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"

export function HomeTasksScreen() {
  const tokens = useDesignTokens()
  const { completeTask, pendingTasks } = useHomeScreen()

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.nativeSheetContent}
      style={{ backgroundColor: tokens.groupedBackground }}
      variant="grouped"
      topInset="none"
    >
      <MotionView>
        <HomeTasksDrawerGroups
          backgroundColor={tokens.surface}
          onComplete={completeTask}
          pendingTasks={pendingTasks}
        />
      </MotionView>
    </AppScrollScreen>
  )
}

export function HomeScreen() {
  const {
    completeTask,
    greeting,
    home,
    isError,
    isLoading,
    refetch,
    homeSummary,
    dismissPayrollNudge,
    openNotifications,
    openPayrollProfile,
    openSchedule,
    openShift,
    openTasks,
    payrollProfileGaps,
    pendingTasks,
    runAction,
    shouldShowPayrollNudge,
    shouldShowTasksSection,
    shouldShowUpdatesSection,
    upcomingShifts,
  } = useHomeScreen()
  const { onRefresh, refreshing } = useRefreshHandler(refetch)

  if (isLoading && !home) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screenContent}>
        <HomeScreenSkeleton />
      </AppScrollScreen>
    )
  }

  if (isError && !home) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screenContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <View style={styles.errorState}>
          <EmptyState
            actionLabel={translate("common:states.retry")}
            onAction={onRefresh}
            subtitle={translate("home:errorSubtitle")}
            title={translate("home:errorTitle")}
          />
        </View>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screenContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <MotionView>
        <HomeHeader
          firstName={home?.profile.firstName ?? ""}
          greeting={greeting}
          hasUnread={(home?.unreadNotifications ?? 0) > 0}
          onNotificationsPress={openNotifications}
          summary={homeSummary}
        />
      </MotionView>

      <View style={styles.stack}>
        {shouldShowPayrollNudge ? (
          <PayrollProfileNudge
            gaps={payrollProfileGaps}
            onPress={openPayrollProfile}
            onDismiss={dismissPayrollNudge}
          />
        ) : null}

        <MotionView delay={50}>
          <HomeTimeCard />
        </MotionView>

        {shouldShowTasksSection ? (
          <MotionView delay={100}>
            <HomeTasksSection
              tasks={pendingTasks}
              onComplete={completeTask}
              onViewAll={openTasks}
            />
          </MotionView>
        ) : null}

        <MotionView delay={150}>
          <UpcomingShiftsSection
            shifts={upcomingShifts}
            onShiftPress={openShift}
            onViewAll={openSchedule}
          />
        </MotionView>

        {shouldShowUpdatesSection ? (
          <MotionView delay={200}>
            <HomeUpdatesSection
              notifications={home?.notifications ?? []}
              onNotificationPress={(notification) => void runAction(notification.action)}
              onViewAll={openNotifications}
            />
          </MotionView>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  errorState: {
    marginTop: 24,
  },
  nativeSheetContent: {
    gap: 16,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  screenContent: {
    paddingHorizontal: 16,
  },
  stack: {
    gap: 18,
    marginTop: 16,
  },
})
