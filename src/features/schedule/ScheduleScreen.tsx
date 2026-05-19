import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestItem, Shift } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { PlanningMonthCalendar } from "@/features/schedule/PlanningMonthCalendar"
import {
  buildMonthGrid,
  getActivePlanningWindow,
  getCalendarDayState,
  getEffectiveAvailability,
  getMonthAnchor,
  getPlanningWindowCoverage,
  getRequestsForDate,
  getShiftsForDate,
  isDateWithinRange,
} from "@/features/schedule/schedule.utils"
import {
  ActionRow,
  AppScrollScreen,
  MetaPill,
  PageHeader,
  SectionBlock,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

function ShiftRow({ shift, onPress }: { shift: Shift; onPress: () => void }) {
  const tokens = useDesignTokens()
  const tone = shift.requiresResponse
    ? tokens.warning
    : shift.status === "confirmed"
      ? tokens.success
      : shift.status === "changed"
        ? tokens.warning
        : tokens.textMuted

  return (
    <Pressable onPress={onPress} style={[styles.shiftRow, { backgroundColor: tokens.surface }]}>
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
  const { selectedEmployer, state } = useScheduleStateQuery()

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
  const selectedShiftNeedingResponse = selectedDayShifts.find((shift) => shift.requiresResponse)
  const isSelectedDateInPlanningWindow = activePlanningWindow
    ? isDateWithinRange(selectedDate, activePlanningWindow.startDate, activePlanningWindow.endDate)
    : false

  const selectedDateLabel = selectedDayShifts.length
    ? `${selectedDayShifts.length} shift${selectedDayShifts.length === 1 ? "" : "s"} scheduled`
    : selectedDayAvailability.status === "unavailable"
      ? "Unavailable"
      : selectedDayAvailability.status === "preferred"
        ? "Preferred to work"
        : "Available"
  const selectedDateSubtitle = selectedDayShifts.length
    ? selectedShiftNeedingResponse
      ? "A shift on this date still needs your response."
      : "Everything scheduled for this date is shown below."
    : selectedDayAvailability.status === "unavailable"
      ? "You marked this date as unavailable."
      : "No shift is assigned yet for this date."
  const availabilitySourceLabel = selectedDayState.hasOverride
    ? "Using a date override"
    : "Using your weekly template"
  const showsAvailabilityTime = selectedDayAvailability.status !== "unavailable"

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <PageHeader eyebrow={selectedEmployer?.name ?? "Planning"} title="Planning" />

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
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      <SectionBlock title={formatFullDate(selectedDate)}>
        <SurfaceCard style={styles.selectedDateCard}>
          <View style={styles.selectedDateHeader}>
            <View style={styles.flex}>
              <Text
                text={selectedDateLabel}
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
            <Pressable
              onPress={() =>
                void runAction({
                  type: "editAvailabilityOverride",
                  date: selectedDate,
                })
              }
              style={({ pressed }) => [
                styles.selectedDateActionButton,
                {
                  backgroundColor: `${tokens.accent}10`,
                  borderColor: `${tokens.accent}20`,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Text text="Edit" size="xxs" weight="semiBold" style={{ color: tokens.accent }} />
            </Pressable>
          </View>

          <View style={styles.selectedDateMeta}>
            {selectedDayState.needsResponse ? (
              <MetaPill
                label="Need response"
                leading={<Ionicons color={tokens.warning} name="alert-circle-outline" size={13} />}
              />
            ) : null}
            {showsAvailabilityTime ? (
              <MetaPill
                label={`${selectedDayAvailability.startTime} - ${selectedDayAvailability.endTime}`}
                leading={<Ionicons color={tokens.textSecondary} name="time-outline" size={13} />}
              />
            ) : null}
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
        </SurfaceCard>
      </SectionBlock>

      <SectionBlock title="Actions for this date">
        <View style={styles.stack}>
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

      <SectionBlock title="Shifts on this date">
        <View style={styles.stack}>
          {selectedDayShifts.length > 0 ? (
            selectedDayShifts.map((shift) => (
              <ShiftRow
                key={shift.id}
                shift={shift}
                onPress={() => router.push(`/(app)/shift/${shift.id}` as never)}
              />
            ))
          ) : (
            <SurfaceCard style={styles.emptyCard}>
              <Text
                text="No shift scheduled"
                size="sm"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text={
                  selectedDayAvailability.status === "unavailable"
                    ? "This date is blocked off in your availability."
                    : "You are free on this date unless a new shift is assigned later."
                }
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </SurfaceCard>
          )}
        </View>
      </SectionBlock>

      <SectionBlock
        actionLabel="Template"
        title="Availability"
        onAction={() => void runAction({ type: "editAvailabilityTemplate" })}
      >
        <SurfaceCard style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <View style={styles.flex}>
              <Text
                text={
                  selectedDayAvailability.status === "preferred"
                    ? "Preferred to work"
                    : selectedDayAvailability.status === "available"
                      ? "Available"
                      : "Unavailable"
                }
                size="sm"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              {showsAvailabilityTime ? (
                <Text
                  text={`${selectedDayAvailability.startTime} - ${selectedDayAvailability.endTime}`}
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                />
              ) : null}
            </View>
            <MetaPill label={selectedDayState.hasOverride ? "Override" : "Template"} />
          </View>

          {selectedDayAvailability.note ? (
            <Text
              text={selectedDayAvailability.note}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          ) : null}

          {isSelectedDateInPlanningWindow && activePlanningWindow ? (
            <Text
              text={`This date belongs to ${activePlanningWindow.label.toLowerCase()} and is due by ${formatShortDate(activePlanningWindow.deadline)}.`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          ) : null}

          <Pressable
            onPress={() =>
              void runAction({
                type: "editAvailabilityOverride",
                date: selectedDate,
              })
            }
            style={({ pressed }) => [
              styles.availabilityPrimaryButton,
              {
                backgroundColor: tokens.accent,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text
              text="Edit availability"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>

          {activePlanningWindow && planningCoverage?.isComplete ? (
            <View
              style={[
                styles.availabilityFooter,
                { borderTopColor: tokens.border, backgroundColor: tokens.transparent },
              ]}
            >
              <View style={styles.flex}>
                <Text
                  text={
                    activePlanningWindow.status === "submitted"
                      ? "Your availability for this planning window has already been submitted."
                      : "When you are done, submit this planning window to confirm your availability."
                  }
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                />
              </View>

              {activePlanningWindow.status === "submitted" ? (
                <MetaPill label="Submitted" />
              ) : (
                <Pressable
                  onPress={async () => {
                    const result = await submitPlanningWindow(activePlanningWindow.id)
                    if (!result.ok) return
                  }}
                  style={[
                    styles.compactActionButton,
                    {
                      backgroundColor: tokens.accentSoft,
                      borderColor: `${tokens.accent}26`,
                    },
                  ]}
                >
                  <Text
                    text="Submit window"
                    size="xxs"
                    weight="semiBold"
                    style={{ color: tokens.accent }}
                  />
                </Pressable>
              )}
            </View>
          ) : null}
        </SurfaceCard>
      </SectionBlock>

      <SectionBlock title="Planning tools">
        <View style={styles.stack}>
          <ActionRow
            onPress={() => void runAction({ type: "editAvailabilityTemplate" })}
            subtitle="Update the pattern that fills most of your month."
            title="Edit weekly template"
            leading={
              <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons color={tokens.accent} name="repeat-outline" size={16} />
              </View>
            }
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />
          <ActionRow
            onPress={() => void runAction({ type: "createScheduleRequest", category: "time_off" })}
            subtitle="Create a general time-off or availability request."
            title="New request"
            leading={
              <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons color={tokens.accent} name="document-text-outline" size={16} />
              </View>
            }
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />
        </View>
      </SectionBlock>

      <SectionBlock
        actionLabel="New"
        title="Pending requests"
        onAction={() => void runAction({ type: "createScheduleRequest", category: "time_off" })}
      >
        <SurfaceCard style={styles.requestCard}>
          {(pendingRequests.length > 0 ? pendingRequests : (state?.requests ?? []))
            .slice(0, 4)
            .map((request, index, items) => (
              <RequestSummaryRow
                key={request.id}
                isLast={index === items.length - 1}
                request={request}
              />
            ))}
        </SurfaceCard>
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
  availabilityCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  availabilityFooter: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  availabilityHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  availabilityPrimaryButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 18,
  },
  compactActionButton: {
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyCard: {
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 18,
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
  selectedDateActionButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedDateCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectedDateHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  selectedDateMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  stack: {
    gap: 10,
  },
})
