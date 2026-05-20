import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, getShiftTimeRange } from "@/core/date"
import type { RequestItem, Shift } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { PlanningMonthCalendar } from "@/features/schedule/PlanningMonthCalendar"
import { PlanningQuickActionsButton } from "@/features/schedule/PlanningQuickActionsButton"
import {
  buildMonthGrid,
  getActivePlanningWindow,
  getCalendarDayState,
  getEffectiveAvailability,
  getMonthAnchor,
  getPlanningWindowCoverage,
  getRequestsForDate,
  getShiftsForDate,
} from "@/features/schedule/schedule.utils"
import type { PlanningQuickActionOption } from "@/features/schedule/showPlanningQuickActions"
import {
  ActionRow,
  AppScrollScreen,
  EmptyState,
  MetaPill,
  MotionView,
  PageHeader,
  SectionBlock,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"
import { fireHaptic } from "@/utils/haptics"

function ShiftRow({
  shift,
  onPress,
  variant = "default",
}: {
  shift: Shift
  onPress: () => void
  variant?: "default" | "embedded"
}) {
  const tokens = useDesignTokens()
  const isEmbedded = variant === "embedded"
  const shiftRowSurfaceStyle = {
    backgroundColor: isEmbedded ? tokens.transparent : tokens.surface,
  }
  const tone = shift.requiresResponse
    ? tokens.warning
    : shift.status === "confirmed"
      ? tokens.success
      : shift.status === "changed"
        ? tokens.warning
        : tokens.textMuted

  return (
    <Pressable
      onPress={onPress}
      style={[styles.shiftRow, isEmbedded ? styles.shiftRowEmbedded : null, shiftRowSurfaceStyle]}
    >
      <View style={styles.shiftRowDate}>
        <View style={[styles.shiftDot, { backgroundColor: tone }]} />
      </View>
      <View style={styles.flex}>
        <Text
          text={getShiftTimeRange(shift)}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${shift.role} · ${shift.venueName}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
        {shift.changeSummary ? (
          <Text text={shift.changeSummary} size="xxs" style={{ color: tone }} />
        ) : null}
      </View>
      <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
    </Pressable>
  )
}

function RequestSummaryRow({ isLast, request }: { isLast?: boolean; request: RequestItem }) {
  const tokens = useDesignTokens()
  const tone =
    request.status === "approved"
      ? tokens.success
      : request.status === "denied"
        ? tokens.danger
        : tokens.warning

  return (
    <View
      style={[
        styles.requestRow,
        !isLast && {
          borderBottomColor: tokens.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.requestGlyph, { backgroundColor: `${tone}14` }]}>
        <Ionicons color={tone} name="document-text-outline" size={16} />
      </View>
      <View style={styles.flex}>
        <Text
          text={request.type}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={request.target.label} size="xxs" style={{ color: tokens.textSecondary }} />
        <Text text={request.statusDetail} size="xxs" style={{ color: tone }} />
      </View>
    </View>
  )
}

export function ScheduleScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { runAction } = useAppAction()
  const { submitPlanningWindow } = useScheduleActions()
  const { state } = useScheduleStateQuery()

  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthAnchor, setMonthAnchor] = useState(() => getMonthAnchor(today))

  const monthCells = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor])
  const activePlanningWindow = state ? getActivePlanningWindow(state) : undefined
  const planningCoverage =
    state && activePlanningWindow
      ? getPlanningWindowCoverage(
          activePlanningWindow,
          state.availabilityTemplate,
          state.availabilityOverrides,
        )
      : undefined
  const selectedDayState =
    state?.availabilityTemplate && state.availabilityOverrides
      ? getCalendarDayState(state, selectedDate)
      : {
          availabilityStatus: "available" as const,
          hasOverride: false,
          hasShift: false,
          isInPlanningWindow: false,
          needsResponse: false,
          shiftCount: 0,
        }
  const selectedDayAvailability = state
    ? getEffectiveAvailability(
        state.availabilityTemplate,
        state.availabilityOverrides,
        selectedDate,
      )
    : {
        date: selectedDate,
        status: "available" as const,
        startTime: "09:00",
        endTime: "17:00",
      }
  const selectedDayShifts = useMemo(
    () => (state ? getShiftsForDate(state.shifts, selectedDate) : []),
    [selectedDate, state],
  )
  const selectedShiftIds = useMemo(
    () => new Set(selectedDayShifts.map((shift) => shift.id)),
    [selectedDayShifts],
  )
  const selectedDayRequests = useMemo(() => {
    const dateRequests = state ? getRequestsForDate(state.requests, selectedDate) : []
    const shiftRequests =
      state?.requests.filter(
        (request) =>
          request.target.kind === "shift" &&
          Boolean(request.target.shiftId && selectedShiftIds.has(request.target.shiftId)),
      ) ?? []

    return [...dateRequests, ...shiftRequests]
  }, [selectedDate, selectedShiftIds, state])
  const pendingRequests = (state?.requests ?? []).filter((request) => request.status === "pending")
  const visibleRequests = (pendingRequests.length > 0 ? pendingRequests : (state?.requests ?? [])).slice(0, 4)
  const selectedShiftNeedingResponse = selectedDayShifts.find((shift) => shift.requiresResponse)
  const nextPlanningWindowDate =
    activePlanningWindow && state
      ? planningCoverage?.dates.find((date) => !state.availabilityOverrides[date])
      : undefined
  const availabilitySourceLabel = selectedDayState.hasOverride
    ? "Using a date override"
    : "Using your weekly template"
  const selectedDateAvailabilityLabel =
    selectedDayAvailability.status === "unavailable"
      ? "Unavailable"
      : selectedDayAvailability.status === "preferred"
        ? "Preferred to work"
        : "Available"
  const selectedDateAvailabilitySubtitle =
    selectedDayAvailability.status === "unavailable"
      ? availabilitySourceLabel
      : `${selectedDayAvailability.startTime} - ${selectedDayAvailability.endTime} · ${availabilitySourceLabel}`

  const hasSelectedDayShift = selectedDayShifts.length > 0
  const selectedDateSubtitle = hasSelectedDayShift
    ? ""
    : selectedDayAvailability.status === "unavailable"
      ? "You marked this date as unavailable."
      : "You are free on this date unless a new shift is assigned later."
  const selectedDateOverrideNote =
    hasSelectedDayShift && selectedDayState.hasOverride
      ? "Availability for this date is using a date override."
      : null
  const selectedDateShiftNote =
    selectedDayShifts.length > 1 ? `${selectedDayShifts.length} shifts are listed below.` : null
  const planningQuickActions = useMemo(() => {
    const options: PlanningQuickActionOption[] = [
      {
        label: "Edit selected date",
        onPress: () =>
          runAction({
            type: "editAvailabilityOverride",
            date: selectedDate,
          }),
        systemImage: "square.and.pencil",
      },
      {
        label: "Weekly template",
        onPress: () => runAction({ type: "editAvailabilityTemplate" }),
        systemImage: "repeat",
      },
    ]

    if (activePlanningWindow) {
      options.push(
        nextPlanningWindowDate
          ? {
              label: "Complete planning window",
              onPress: () =>
                runAction({
                  type: "editAvailabilityOverride",
                  date: nextPlanningWindowDate,
                }),
              section: "secondary",
              systemImage: "calendar",
            }
          : {
              label: "Submit planning window",
              onPress: async () => {
                const result = await submitPlanningWindow(activePlanningWindow.id)
                if (!result.ok) {
                  fireHaptic("error")
                  return
                }

                fireHaptic("success")
              },
              section: "secondary",
              systemImage: "checkmark.circle",
            },
      )
    }

    return options
  }, [activePlanningWindow, nextPlanningWindowDate, runAction, selectedDate, submitPlanningWindow])

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <PageHeader
        delay={0}
        title="Planning"
        trailing={<PlanningQuickActionsButton options={planningQuickActions} title="Planning" />}
      />

      <MotionView delay={55}>
        <PlanningMonthCalendar
          anchorDate={monthAnchor}
          cells={monthCells}
          getDayState={(dateString) =>
            state
              ? getCalendarDayState(state, dateString)
              : {
                  availabilityStatus: "available",
                  hasOverride: false,
                  hasShift: false,
                  isInPlanningWindow: false,
                  needsResponse: false,
                  shiftCount: 0,
                }
          }
          onNextMonth={() => {
            const nextAnchor = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1, 12)
            setMonthAnchor(nextAnchor)
            setSelectedDate(nextAnchor.toISOString().slice(0, 10))
          }}
          onPrevMonth={() => {
            const previousAnchor = new Date(
              monthAnchor.getFullYear(),
              monthAnchor.getMonth() - 1,
              1,
              12,
            )
            setMonthAnchor(previousAnchor)
            setSelectedDate(previousAnchor.toISOString().slice(0, 10))
          }}
          onLongPressDate={(dateString) => {
            setSelectedDate(dateString)
            void runAction({
              type: "editAvailabilityOverride",
              date: dateString,
            })
          }}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      </MotionView>

      <SectionBlock key={`selected-${selectedDate}`} motionDelay={110} title={formatFullDate(selectedDate)}>
        <SurfaceCard
          style={[
            styles.selectedDateCard,
            hasSelectedDayShift ? styles.selectedDateShiftCard : null,
          ]}
        >
          {hasSelectedDayShift ? null : (
            <>
              <View style={styles.selectedDateHeader}>
                <View style={styles.selectedDateCopy}>
                  <Text
                    text="No shift scheduled"
                    size="sm"
                    weight="semiBold"
                    style={{ color: tokens.textPrimary }}
                  />
                  <Text
                    text={selectedDateSubtitle}
                    size="xxs"
                    style={{ color: tokens.textSecondary }}
                  />
                </View>
              </View>

              <View style={styles.selectedDateMeta}>
                <MetaPill
                  label={availabilitySourceLabel}
                  leading={
                    <Ionicons
                      color={
                        selectedDayAvailability.status === "preferred"
                          ? tokens.accent
                          : selectedDayAvailability.status === "available"
                            ? tokens.success
                            : tokens.textMuted
                      }
                      name="ellipse"
                      size={11}
                    />
                  }
                />
              </View>
            </>
          )}

          {selectedDayShifts.length === 1 ? (
            <ShiftRow
              shift={selectedDayShifts[0]}
              variant="embedded"
              onPress={() => router.push(`/(app)/shift/${selectedDayShifts[0].id}` as never)}
            />
          ) : null}

          {selectedDayRequests.length > 0 ? (
            <View
              style={[
                styles.inlineNotice,
                { backgroundColor: `${tokens.warning}12`, borderColor: `${tokens.warning}22` },
              ]}
            >
              <Ionicons color={tokens.warning} name="document-text-outline" size={14} />
              <Text
                text={`${selectedDayRequests.length} request${selectedDayRequests.length === 1 ? "" : "s"} already touch this date.`}
                size="xxs"
                weight="medium"
                style={{ color: tokens.warning }}
              />
            </View>
          ) : null}

          {selectedDateOverrideNote ? (
            <Text
              text={selectedDateOverrideNote}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          ) : null}

          {selectedDateShiftNote ? (
            <Text text={selectedDateShiftNote} size="xxs" style={{ color: tokens.textSecondary }} />
          ) : null}
        </SurfaceCard>
      </SectionBlock>

      <SectionBlock motionDelay={165} title="Actions for this date">
        <View style={styles.stack}>
          <ActionRow
            onPress={() =>
              void runAction({
                type: "editAvailabilityOverride",
                date: selectedDate,
              })
            }
            subtitle={selectedDateAvailabilitySubtitle}
            title={`Availability: ${selectedDateAvailabilityLabel}`}
            leading={
              <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons color={tokens.accent} name="calendar-outline" size={16} />
              </View>
            }
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />

          {selectedShiftNeedingResponse ? (
            <ActionRow
              onPress={() =>
                router.push(`/(app)/shift/${selectedShiftNeedingResponse.id}` as never)
              }
              subtitle="Review the updated shift and confirm it from the detail view."
              title="Review shift change"
              leading={
                <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                  <Ionicons color={tokens.accent} name="flash-outline" size={16} />
                </View>
              }
              trailing={
                <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
              }
            />
          ) : null}

          <ActionRow
            onPress={() =>
              void runAction({
                type: "createScheduleRequest",
                category: selectedDayShifts.length > 0 ? "shift_change" : "time_off",
                shiftId: selectedDayShifts[0]?.id,
              })
            }
            subtitle={
              selectedDayShifts.length > 0
                ? "Ask for a replacement or flag a conflict for this shift."
                : "Request time off or explain a conflict on this day."
            }
            title={selectedDayShifts.length > 0 ? "Request a change" : "Create request"}
            leading={
              <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons
                  color={tokens.accent}
                  name={
                    selectedDayShifts.length > 0
                      ? "swap-horizontal-outline"
                      : "document-text-outline"
                  }
                  size={16}
                />
              </View>
            }
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />
        </View>
      </SectionBlock>

      {selectedDayShifts.length > 1 ? (
        <SectionBlock motionDelay={220} title="Scheduled shifts">
          <View style={styles.stack}>
            {selectedDayShifts.map((shift) => (
              <ShiftRow
                key={shift.id}
                shift={shift}
                onPress={() => router.push(`/(app)/shift/${shift.id}` as never)}
              />
            ))}
          </View>
        </SectionBlock>
      ) : null}

      <SectionBlock motionDelay={275} title="Pending requests">
        {visibleRequests.length > 0 ? (
          <SurfaceCard style={styles.requestCard}>
            {visibleRequests.map((request, index, items) => (
              <RequestSummaryRow
                key={request.id}
                isLast={index === items.length - 1}
                request={request}
              />
            ))}
          </SurfaceCard>
        ) : (
          <EmptyState
            icon={<Ionicons color={tokens.textMuted} name="document-text-outline" size={18} />}
            subtitle="Requests you send from planning will show up here while they are being reviewed."
            title="No requests yet"
          />
        )}
      </SectionBlock>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  actionGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  flex: {
    flex: 1,
  },
  inlineNotice: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  requestCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  requestGlyph: {
    alignItems: "center",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  requestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
  selectedDateCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectedDateCopy: {
    flex: 1,
    gap: 4,
  },
  selectedDateHeader: {
    alignItems: "flex-start",
    minHeight: 22,
  },
  selectedDateMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedDateShiftCard: {
    gap: 8,
    paddingVertical: 12,
  },
  shiftDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  shiftRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  shiftRowDate: {
    alignItems: "center",
    justifyContent: "center",
    width: 18,
  },
  shiftRowEmbedded: {
    borderRadius: 0,
    gap: 10,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  stack: {
    gap: 10,
  },
})
