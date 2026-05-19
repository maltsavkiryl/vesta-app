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
import { AppScrollScreen, MotionView, useDesignTokens } from "@/ui"

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
    openLatestPayslip,
    openNotifications,
    openSchedule,
    openShift,
    pendingTasks,
    router,
    runAction,
    upcomingShifts,
  } = useHomeScreen()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screenContent}>
      <MotionView>
        <HomeHeader
          firstName={home?.profile.firstName ?? ""}
          greeting={greeting}
          hasUnread={(home?.unreadNotifications ?? 0) > 0}
          onNotificationsPress={openNotifications}
        />
      </MotionView>

      <View style={styles.stack}>
        <MotionView delay={50}>
          <HomeTimeCard />
        </MotionView>

        <MotionView delay={100}>
          <UpcomingShiftsSection
            shifts={upcomingShifts}
            onShiftPress={openShift}
            onViewAll={openSchedule}
          />
        </MotionView>

        <MotionView delay={150}>
          <EarningsSummaryCard
            earnedAmount={home?.earnings.earnedAmount ?? 0}
            monthLabel={home?.earnings.monthLabel ?? ""}
            onPayslipPress={openLatestPayslip}
          />
        </MotionView>

        <MotionView delay={200}>
          <HomeTasksSection
            tasks={pendingTasks}
            onComplete={completeTask}
            onViewAll={() => router.push("/(app)/tasks" as never)}
          />
        </MotionView>

        <MotionView delay={250}>
          <HomeUpdatesSection
            notifications={home?.notifications ?? []}
            onNotificationPress={(notification) => void runAction(notification.action)}
            onViewAll={openNotifications}
          />
        </MotionView>
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
