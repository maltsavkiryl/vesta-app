import { StyleSheet, View } from "react-native"

import { EarningsSummaryCard } from "@/features/home/components/EarningsSummaryCard"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { HomeScreenSkeleton } from "@/features/home/components/HomeScreenSkeleton"
import {
  HomeTasksDrawerGroups,
  HomeTasksSection,
  HomeUpdatesSection,
} from "@/features/home/components/HomeTaskSections"
import { HomeTimeCard } from "@/features/home/components/HomeTimeCard"
import { UpcomingShiftsSection } from "@/features/home/components/UpcomingShiftsSection"
import { useHomeScreen } from "@/features/home/useHomeScreen"
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
    openLatestPayslip,
    openNotifications,
    openSchedule,
    openShift,
    openTasks,
    pendingTasks,
    runAction,
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
            actionLabel="Try again"
            onAction={onRefresh}
            subtitle="We couldn't load your home overview. Check your connection and try again."
            title="Something went wrong"
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

        <MotionView delay={250}>
          <EarningsSummaryCard
            averageHourlyRate={home?.earnings.averageHourlyRate ?? 0}
            earnedAmount={home?.earnings.earnedAmount ?? 0}
            hoursWorked={home?.earnings.hoursWorked ?? 0}
            monthLabel={home?.earnings.monthLabel ?? ""}
            onPayslipPress={openLatestPayslip}
            shiftsWorked={home?.earnings.shiftsWorked ?? 0}
            targetAmount={home?.earnings.targetAmount ?? 0}
          />
        </MotionView>
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
