import { StyleSheet, View } from "react-native"

import { EarningsSummaryCard } from "@/features/home/components/EarningsSummaryCard"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import {
  HomeTasksDrawerGroups,
  HomeTasksSection,
  HomeUpdatesSection,
} from "@/features/home/components/HomeTaskSections"
import { HomeTimeCard } from "@/features/home/components/HomeTimeCard"
import { UpcomingShiftsSection } from "@/features/home/components/UpcomingShiftsSection"
import { useHomeScreen } from "@/features/home/useHomeScreen"
import { AppScrollScreen, useDesignTokens } from "@/ui"

export function HomeTasksScreen() {
  const tokens = useDesignTokens()
  const { completeTask, pendingTasks } = useHomeScreen()

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.nativeSheetContent}
      style={{ backgroundColor: tokens.background }}
      topInset="none"
    >
      <HomeTasksDrawerGroups
        backgroundColor={tokens.surface}
        onComplete={completeTask}
        pendingTasks={pendingTasks}
      />
    </AppScrollScreen>
  )
}

export function HomeScreen() {
  const {
    completeTask,
    greeting,
    hideTask,
    home,
    openDocuments,
    openNotifications,
    openProfile,
    openSchedule,
    openShift,
    pendingTasks,
    router,
    runAction,
    upcomingShifts,
  } = useHomeScreen()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screenContent}>
      <HomeHeader
        employerName={home?.selectedEmployer?.name}
        firstName={home?.profile.firstName ?? ""}
        greeting={greeting}
        hasUnread={(home?.unreadNotifications ?? 0) > 0}
        role={home?.profile.role}
        onEmployerPress={openProfile}
        onNotificationsPress={openNotifications}
      />

      <View style={styles.stack}>
        <HomeTimeCard />

        <UpcomingShiftsSection
          shifts={upcomingShifts}
          onShiftPress={openShift}
          onSeeAll={openSchedule}
        />

        <EarningsSummaryCard
          earnedAmount={home?.earnings.earnedAmount ?? 0}
          monthLabel={home?.earnings.monthLabel ?? ""}
          onPayslipPress={openDocuments}
        />

        <HomeTasksSection
          tasks={pendingTasks}
          onComplete={completeTask}
          onDismiss={hideTask}
          onShowAll={() => router.push("/(app)/tasks" as never)}
        />

        <HomeUpdatesSection
          notifications={home?.notifications ?? []}
          onNotificationPress={(notification) => void runAction(notification.action)}
          onShowAll={openNotifications}
        />
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
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
