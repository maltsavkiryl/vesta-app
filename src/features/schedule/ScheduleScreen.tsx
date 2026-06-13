import { Pressable, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate } from "@/core/date"
import { PlanningMonthCalendar } from "@/features/schedule/PlanningMonthCalendar"
import { PlanningQuickActionsButton } from "@/features/schedule/PlanningQuickActionsButton"
import {
  ScheduleAgendaList,
  ScheduleDateActionsSection,
  ScheduleNextShiftHero,
  SchedulePendingRequestsSection,
  SchedulePlanningWindowCard,
  SchedulePlanningWindowSubmittedCard,
  ScheduleScreenSkeleton,
  ScheduleSelectedDateSection,
  ScheduleShiftListSection,
} from "@/features/schedule/ScheduleScreenSections"
import { useScheduleScreen } from "@/features/schedule/useScheduleScreen"
import {
  AppScrollScreen,
  AppSegmentedControl,
  EmptyState,
  MotionView,
  PageHeader,
  Text,
  useDesignTokens,
} from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"

export function ScheduleScreen() {
  const tokens = useDesignTokens()
  const screen = useScheduleScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isLoading && !screen.activePlanningWindow && screen.agendaSections.length === 0) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <PageHeader delay={0} title="Schedule" />
        <ScheduleScreenSkeleton />
      </AppScrollScreen>
    )
  }

  if (screen.isError && screen.agendaSections.length === 0) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageHeader delay={0} title="Schedule" />
        <EmptyState
          actionLabel="Try again"
          onAction={onRefresh}
          subtitle="We couldn't load your schedule. Check your connection and try again."
          title="Something went wrong"
        />
      </AppScrollScreen>
    )
  }

  const planningWindow = screen.activePlanningWindow

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <PageHeader
        delay={0}
        title="Schedule"
        trailing={
          <PlanningQuickActionsButton options={screen.planningQuickActions} title="Planning" />
        }
      />

      <MotionView delay={45}>
        <ScheduleNextShiftHero
          countdown={screen.nextShiftCountdown}
          onOpenShift={screen.handleOpenShift}
          shift={screen.nextShift}
        />
      </MotionView>

      {planningWindow ? (
        planningWindow.status === "open" ? (
          <SchedulePlanningWindowCard
            coverage={screen.planningCoverage}
            deadlineCountdown={screen.planningDeadlineCountdown}
            onCompleteNext={screen.handleCompletePlanningWindow}
            onSubmit={screen.handleSubmitPlanningWindow}
            window={planningWindow}
          />
        ) : (
          <SchedulePlanningWindowSubmittedCard window={planningWindow} />
        )
      ) : null}

      <MotionView delay={90} style={styles.controlRow}>
        <AppSegmentedControl
          onChange={screen.setViewMode}
          options={[
            { label: "Agenda", value: "agenda" },
            { label: "Calendar", value: "calendar" },
          ]}
          style={styles.segmented}
          value={screen.viewMode}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          onPress={screen.handleJumpToToday}
          style={[styles.todayChip, { backgroundColor: tokens.accentSoft }]}
        >
          <Ionicons color={tokens.accent} name="locate-outline" size={14} />
          <Text text="Today" size="xxs" weight="semiBold" style={{ color: tokens.accent }} />
        </Pressable>
      </MotionView>

      {screen.viewMode === "agenda" ? (
        <ScheduleAgendaList onOpenShift={screen.handleOpenShift} sections={screen.agendaSections} />
      ) : (
        <>
          <MotionView delay={120}>
            <PlanningMonthCalendar
              anchorDate={screen.monthAnchor}
              cells={screen.monthCells}
              getDayState={screen.getDayState}
              onNextMonth={screen.handleNextMonth}
              onPrevMonth={screen.handlePrevMonth}
              onLongPressDate={screen.handleLongPressDate}
              onSelectDate={screen.setSelectedDate}
              selectedDate={screen.selectedDate}
            />
          </MotionView>

          <ScheduleSelectedDateSection
            availabilitySourceLabel={screen.availabilitySourceLabel}
            hasSelectedDayShift={screen.hasSelectedDayShift}
            onOpenShift={screen.handleOpenShift}
            requests={screen.selectedDayRequests}
            selectedDateOverrideNote={screen.selectedDateOverrideNote}
            selectedDateShiftNote={screen.selectedDateShiftNote}
            selectedDateSubtitle={screen.selectedDateSubtitle}
            selectedDateTitle={formatFullDate(screen.selectedDate)}
            selectedDayAvailabilityStatus={screen.selectedDayAvailability.status}
            shifts={screen.selectedDayShifts}
          />

          <ScheduleDateActionsSection
            onCreateRequest={screen.handleCreateRequest}
            onEditSelectedDate={screen.handleEditSelectedDate}
            onOpenSelectedShiftNeedingResponse={() => {
              if (screen.selectedShiftNeedingResponse) {
                screen.handleOpenShift(screen.selectedShiftNeedingResponse.id)
              }
            }}
            selectedDateAvailabilityLabel={screen.selectedDateAvailabilityLabel}
            selectedDateAvailabilitySubtitle={screen.selectedDateAvailabilitySubtitle}
            selectedDayShifts={screen.selectedDayShifts}
            selectedShiftNeedingResponse={screen.selectedShiftNeedingResponse}
          />

          <ScheduleShiftListSection
            shifts={screen.selectedDayShifts}
            onOpenShift={screen.handleOpenShift}
          />
        </>
      )}

      <SchedulePendingRequestsSection requests={screen.visibleRequests} />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  controlRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
  segmented: {
    flex: 1,
  },
  todayChip: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
})
