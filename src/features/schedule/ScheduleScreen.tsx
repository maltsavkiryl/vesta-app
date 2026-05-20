import { StyleSheet } from "react-native"

import { formatFullDate } from "@/core/date"
import { PlanningMonthCalendar } from "@/features/schedule/PlanningMonthCalendar"
import { PlanningQuickActionsButton } from "@/features/schedule/PlanningQuickActionsButton"
import {
  ScheduleDateActionsSection,
  SchedulePendingRequestsSection,
  ScheduleSelectedDateSection,
  ScheduleShiftListSection,
} from "@/features/schedule/ScheduleScreenSections"
import { useScheduleScreen } from "@/features/schedule/useScheduleScreen"
import {
  AppScrollScreen,
  MotionView,
  PageHeader,
} from "@/ui"

export function ScheduleScreen() {
  const screen = useScheduleScreen()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <PageHeader
        delay={0}
        title="Planning"
        trailing={<PlanningQuickActionsButton options={screen.planningQuickActions} title="Planning" />}
      />

      <MotionView delay={55}>
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

      <SchedulePendingRequestsSection requests={screen.visibleRequests} />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
