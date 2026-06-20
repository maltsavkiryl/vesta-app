import { useEffect } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import type { PlanningSwapCandidate, Shift } from "@/core/models"
import { AppButton, AppScrollScreen, GroupedSection, Skeleton, SuccessState, TextField, useDesignTokens } from "@/ui"
import { useToast } from "@/ui/feedback"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"
import { getShiftTimeRange, formatShortDate } from "@/core/date"
import { useListItemEntrance, useCelebratePulse } from "@/ui/foundations/motion"
import { usePlanningSwapNewScreen } from "./usePlanningSwapNewScreen"
import { fireHaptic } from "@/utils/haptics"

function ShiftPickerRow({
  index,
  isSelected,
  onSelect,
  shift,
}: {
  index: number
  isSelected: boolean
  onSelect: () => void
  shift: Shift
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 20, step: 36 })
  const { animatedStyle: pulseStyle, triggerPulse } = useCelebratePulse()

  useEffect(() => {
    if (isSelected) {
      triggerPulse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected])

  return (
    <Animated.View style={entranceStyle}>
      <Animated.View style={pulseStyle}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: isSelected }}
          onPress={onSelect}
          style={[
            styles.shiftRow,
            {
              borderColor: isSelected ? tokens.accent : tokens.border,
              backgroundColor: isSelected ? tokens.accentMuted : tokens.surface,
            },
          ]}
        >
          <View style={styles.shiftRowContent}>
            <Text size="xs" style={{ color: tokens.textPrimary }} text={formatShortDate(shift.date)} weight="medium" />
            <Text size="xxs" style={{ color: tokens.textSecondary }} text={getShiftTimeRange(shift)} />
          </View>
          {isSelected ? (
            <Ionicons color={tokens.accent} name="checkmark-circle" size={18} />
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

function CandidatePickerRow({
  candidate,
  index,
  isSelected,
  onSelect,
}: {
  candidate: PlanningSwapCandidate
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 20, step: 36 })
  const { animatedStyle: pulseStyle, triggerPulse } = useCelebratePulse()

  useEffect(() => {
    if (isSelected) {
      triggerPulse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected])

  const timeRange = `${candidate.startTime} - ${candidate.endTime}`

  return (
    <Animated.View style={entranceStyle}>
      <Animated.View style={pulseStyle}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: isSelected }}
          onPress={onSelect}
          style={[
            styles.shiftRow,
            {
              borderColor: isSelected ? tokens.accent : tokens.border,
              backgroundColor: isSelected ? tokens.accentMuted : tokens.surface,
            },
          ]}
        >
          <View style={styles.shiftRowContent}>
            <Text size="xs" style={{ color: tokens.textPrimary }} text={candidate.employeeName} weight="medium" />
            <Text size="xxs" style={{ color: tokens.textSecondary }} text={`${formatShortDate(candidate.shiftDate)}  ${timeRange}`} />
            <Text size="xxs" style={{ color: tokens.textMuted }} text={`${candidate.taskName} · ${candidate.city}`} />
          </View>
          {isSelected ? (
            <Ionicons color={tokens.accent} name="checkmark-circle" size={18} />
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

export function PlanningSwapNewScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningSwapNewScreen()
  const { showSuccess } = useToast()

  useEffect(() => {
    if (screen.success) {
      fireHaptic("success")
      showSuccess(translate("planning:requests.submitSuccess"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.success])

  if (screen.success) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <SuccessState title={translate("planning:requests.submitSuccess")}>
          <AppButton label={translate("common:actions.close")} onPress={screen.handleDismiss} variant="secondary" />
        </SuccessState>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <GroupedSection title={translate("planning:requests.shiftSwap")}>
        {screen.myShifts.length === 0 && !screen.isLoading ? (
          <Text size="xs" style={{ color: tokens.textMuted, padding: 16 }} text={translate("planning:schedule.noShifts")} />
        ) : (
          <View style={styles.shiftList}>
            {screen.myShifts.map((shift, index) => (
              <ShiftPickerRow
                key={shift.id}
                index={index}
                isSelected={screen.selectedShiftId === shift.id}
                onSelect={() => screen.handleSelectShift(shift.id)}
                shift={shift}
              />
            ))}
          </View>
        )}
      </GroupedSection>

      <GroupedSection title={translate("planning:requests.candidatePickerTitle")}>
        {!screen.selectedShiftId ? (
          <Text
            size="xs"
            style={{ color: tokens.textMuted, padding: 16 }}
            text={translate("planning:requests.pickShiftFirst")}
          />
        ) : screen.isCandidatesLoading ? (
          <View style={styles.skeletonList}>
            <Skeleton height={60} radius={10} />
            <Skeleton height={60} radius={10} />
            <Skeleton height={60} radius={10} />
          </View>
        ) : screen.isCandidatesError ? (
          <View style={[styles.errorRow, { backgroundColor: tokens.dangerSoft }]}>
            <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
            <Text size="xxs" style={{ color: tokens.danger }} text={translate("planning:requests.submitError")} />
          </View>
        ) : screen.candidateList.length === 0 ? (
          <Text
            size="xs"
            style={{ color: tokens.textMuted, padding: 16 }}
            text={translate("planning:requests.noSwapCandidates")}
          />
        ) : (
          <View style={styles.shiftList}>
            {screen.candidateList.map((candidate, index) => (
              <CandidatePickerRow
                key={candidate.shiftId}
                candidate={candidate}
                index={index}
                isSelected={screen.selectedCandidateShiftId === candidate.shiftId}
                onSelect={() => screen.setSelectedCandidateShiftId(candidate.shiftId)}
              />
            ))}
          </View>
        )}
      </GroupedSection>

      <View style={styles.fieldBody}>
        <TextField
          label={translate("planning:requests.noteOptional")}
          multiline
          numberOfLines={3}
          onChangeText={screen.setNote}
          placeholder={translate("planning:requests.notePlaceholder")}
          value={screen.note}
          inputStyle={styles.textAreaInput}
        />
      </View>

      {screen.error ? (
        <View style={[styles.errorRow, { backgroundColor: tokens.dangerSoft }]}>
          <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
          <Text size="xxs" style={{ color: tokens.danger }} text={screen.error} />
        </View>
      ) : null}

      <AppButton
        disabled={!screen.canSubmit || screen.isSubmitting}
        fullWidth
        isLoading={screen.isSubmitting}
        label={translate("planning:requests.shiftSwap")}
        onPress={() => { void screen.handleSubmit() }}
        pressHaptic="none"
      />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  errorRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldBody: {
    gap: 12,
  },
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
  shiftList: {
    gap: 0,
    padding: 8,
  },
  shiftRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  shiftRowContent: {
    flex: 1,
    gap: 2,
  },
  skeletonList: {
    gap: 8,
    padding: 8,
  },
  textAreaInput: {
    minHeight: 64,
    textAlignVertical: "top",
  },
})
