/* eslint-disable react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestCategory } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { isRequestCategory, requestCategoryConfig } from "@/features/schedule/requestCategories"
import { enumerateDateRange } from "@/features/schedule/schedule.utils"
import {
  AppButton,
  AppScrollScreen,
  EmptyState,
  SelectionChip,
  SelectionIndicator,
  SelectionRow,
  GroupedSection,
  SuccessState,
  SurfaceCard,
  Text,
  TextField,
  useDesignTokens,
} from "@/ui"
import { fireHaptic } from "@/utils/haptics"

function formatDateListLabel(dates: string[]) {
  if (dates.length === 0) return ""
  if (dates.length === 1) return formatShortDate(dates[0])
  const sorted = [...dates].sort((left, right) => left.localeCompare(right))
  return `${formatShortDate(sorted[0] ?? "")} - ${formatShortDate(sorted[sorted.length - 1] ?? "")}`
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function getTargetSectionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      sectionTitle: "Shift",
      subtitle: "Pick the exact shift that needs support so everyone reviews the right context.",
    }
  }

  if (category === "availability_issue") {
    return {
      sectionTitle: "Affected dates",
      subtitle: "Mark the days that no longer match your current availability.",
    }
  }

  return {
    sectionTitle: "Dates",
    subtitle: "Choose one or more dates so your manager can review the request quickly.",
  }
}

function getSuccessCopy(category: RequestCategory) {
  return category === "shift_change"
    ? "Your manager and the team coordinating replacements now have the shift details and reason."
    : "Your manager now has the dates and context they need to review this request."
}

function getRequestActionCopy(category: RequestCategory) {
  if (category === "shift_change") {
    return {
      reasonTitle: "Why do you need a swap?",
      screenTitle: "Shift swap",
      submitLabel: "Send shift swap",
    }
  }

  if (category === "availability_issue") {
    return {
      reasonTitle: "Why is your availability changing?",
      screenTitle: "Unavailability",
      submitLabel: "Send unavailability",
    }
  }

  return {
    reasonTitle: "Why do you need time off?",
    screenTitle: "Time off",
    submitLabel: "Send time off",
  }
}

export function RequestScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { createRequest } = useScheduleActions()
  const { state } = useScheduleStateQuery()
  const params = useLocalSearchParams<{ category?: RequestCategory; shiftId?: string }>()

  const category = isRequestCategory(params.category) ? params.category : "time_off"
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedShiftId, setSelectedShiftId] = useState(params.shiftId ?? "")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [done, setDone] = useState(false)

  const today = getTodayDateString()
  const config = requestCategoryConfig[category]
  const actionCopy = getRequestActionCopy(category)
  const targetSectionCopy = getTargetSectionCopy(category)
  const activePlanningWindow = state?.planningWindows.find((window) => window.status === "open")
  const requestDates = activePlanningWindow
    ? enumerateDateRange(activePlanningWindow.startDate, activePlanningWindow.endDate)
    : []
  const upcomingShifts = useMemo(
    () =>
      (state?.shifts ?? []).filter(
        (shift) => shift.id === params.shiftId || shift.date >= today,
      ),
    [params.shiftId, state?.shifts, today],
  )
  const selectedShift = upcomingShifts.find((shift) => shift.id === selectedShiftId)
  const targetSelected = category === "shift_change" ? Boolean(selectedShiftId) : selectedDates.length > 0
  const summaryTarget =
    category === "shift_change"
      ? selectedShift
        ? `${selectedShift.dayLabel} · ${getShiftTimeRange(selectedShift)}`
        : ""
      : formatDateListLabel(selectedDates)
  const detailTargetLabel =
    category === "shift_change"
      ? selectedShift
        ? `${selectedShift.role} · ${selectedShift.venueName}`
        : ""
      : selectedDates.length === 1
        ? formatFullDate(selectedDates[0] ?? "")
        : selectedDates.length > 1
          ? `${selectedDates.length} dates selected`
          : ""
  const canSubmit = Boolean(reason.trim()) && targetSelected

  if (done) {
    return (
      <AppScrollScreen
        contentContainerStyle={[styles.doneScreen, { paddingBottom: insets.bottom + 30 }]}
        variant="grouped"
      >
        <SuccessState subtitle={getSuccessCopy(category)} title="Request sent" />
        <View style={styles.doneDetails}>
          <SurfaceCard style={styles.doneSummaryCard}>
            <Text
              text={actionCopy.screenTitle}
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.textSecondary }}
            />
            <Text text={summaryTarget} size="sm" weight="semiBold" style={{ color: tokens.textPrimary }} />
            {detailTargetLabel ? (
              <Text text={detailTargetLabel} size="xxs" style={{ color: tokens.textSecondary }} />
            ) : null}
            <Text text={reason} size="xxs" style={{ color: tokens.textSecondary }} />
          </SurfaceCard>
          <AppButton fullWidth label="Done" onPress={() => router.back()} />
        </View>
      </AppScrollScreen>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: tokens.groupedBackground }]}
    >
      <View style={styles.flex}>
        <Stack.Screen options={{ title: actionCopy.screenTitle }} />
        <AppScrollScreen
          contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 28 }]}
          variant="grouped"
        >
          <GroupedSection bodyStyle={styles.sectionBody} title={targetSectionCopy.sectionTitle}>
            <View style={styles.groupBody}>
              <Text text={targetSectionCopy.subtitle} size="xs" style={{ color: tokens.textSecondary }} />
              {category === "shift_change" ? (
                upcomingShifts.length > 0 ? (
                  <View style={styles.shiftList}>
                    {upcomingShifts.map((shift, index) => {
                      const selected = selectedShiftId === shift.id

                      return (
                        <SelectionRow
                          backgroundColor={selected ? tokens.accentSoft : tokens.surface}
                          dividerInset={16}
                          isLast={index === upcomingShifts.length - 1}
                          key={shift.id}
                          onPress={() => setSelectedShiftId(shift.id)}
                          selected={selected}
                          style={styles.shiftRow}
                          subtitle={`${formatFullDate(shift.date)} · ${shift.role} · ${shift.venueName}`}
                          title={`${shift.dayLabel} · ${getShiftTimeRange(shift)}`}
                          trailing={selected ? <SelectionIndicator /> : null}
                        />
                      )
                    })}
                  </View>
                ) : (
                  <EmptyState
                    subtitle="There are no upcoming shifts available for a change request right now."
                    title="No shifts to choose from"
                  />
                )
              ) : requestDates.length > 0 ? (
                <View style={styles.dateWrap}>
                  {requestDates.map((date) => {
                    const selected = selectedDates.includes(date)
                    return (
                      <SelectionChip
                        key={date}
                        label={formatShortDate(date)}
                        onPress={() =>
                          setSelectedDates((current) =>
                            current.includes(date)
                              ? current.filter((item) => item !== date)
                              : [...current, date].sort((left, right) => left.localeCompare(right)),
                          )
                        }
                        selected={selected}
                        selectedVariant="solid"
                      />
                    )
                  })}
                </View>
              ) : (
                <EmptyState
                  subtitle="A planning window needs to be open before you can send a date-based request."
                  title="No open planning window"
                />
              )}
            </View>
          </GroupedSection>

          <GroupedSection bodyStyle={styles.sectionBody} title={actionCopy.reasonTitle}>
            <View style={styles.groupBody}>
              <View style={styles.reasonWrap}>
                {config.reasonPresets.map((option) => {
                  const selected = option === reason
                  return (
                    <SelectionChip
                      key={option}
                      label={option}
                      onPress={() => setReason(selected ? "" : option)}
                      selected={selected}
                      selectedVariant="solid"
                    />
                  )
                })}
              </View>
            </View>
          </GroupedSection>

          <GroupedSection bodyStyle={styles.sectionBody} title="Note">
            <View style={styles.groupBody}>
              <TextField
                caption="Optional context shown with your request."
                containerStyle={styles.noteShell}
                inputStyle={styles.noteInput}
                label="Add a note"
                multiline
                numberOfLines={4}
                onChangeText={setNote}
                placeholder="Anything your manager should know"
                textAlignVertical="top"
                value={note}
                variant="muted"
              />
            </View>
          </GroupedSection>

          <View style={styles.submitBlock}>
            <AppButton
              disabled={!canSubmit}
              fullWidth
              label={actionCopy.submitLabel}
              onPress={async () => {
                const result = await createRequest({
                  category,
                  note: note.trim() || undefined,
                  reason,
                  statusDetail:
                    category === "shift_change"
                      ? "Waiting for colleague and manager approval"
                      : "Waiting for manager review",
                  target:
                    category === "shift_change"
                      ? {
                          kind: "shift",
                          label: summaryTarget,
                          shiftId: selectedShiftId,
                        }
                      : {
                          endDate: selectedDates[selectedDates.length - 1],
                          kind: "dates",
                          label: summaryTarget,
                          startDate: selectedDates[0],
                        },
                  type: config.type,
                })
                if (!result.ok) {
                  fireHaptic("error")
                  return
                }

                fireHaptic("success")
                setDone(true)
              }}
              pressHaptic="none"
            />
          </View>
        </AppScrollScreen>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  dateWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  doneScreen: {
    justifyContent: "center",
    minHeight: "100%",
    paddingHorizontal: 20,
  },
  doneDetails: {
    alignSelf: "stretch",
    gap: 14,
    paddingTop: 18,
  },
  doneSummaryCard: {
    alignSelf: "stretch",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  groupBody: {
    gap: 14,
  },
  noteInput: {
    fontSize: 15,
    minHeight: 96,
    paddingTop: 2,
  },
  noteShell: {
    minHeight: 146,
  },
  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  screen: {
    gap: 20,
    paddingHorizontal: 20,
  },
  sectionBody: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    overflow: "visible",
    padding: 0,
    shadowOpacity: 0,
  },
  shiftList: {
    gap: 0,
  },
  shiftRow: {
    borderRadius: 0,
    borderWidth: 0,
    minHeight: 74,
  },
  submitBlock: {
    paddingTop: 4,
  },
})
