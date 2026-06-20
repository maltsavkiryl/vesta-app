import { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import Animated from "react-native-reanimated"

import { formatShortDate, formatLocalDate, formatTimeLabel, getShiftTimeRange } from "@/core/date"
import type { Shift } from "@/core/models"
import { translate } from "@/i18n/translate"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  SuccessState,
  TextField,
  useDesignTokens,
} from "@/ui"
import { useToast } from "@/ui/feedback"
import { useListItemEntrance, useCelebratePulse } from "@/ui/foundations/motion"
import { Text } from "@/ui/primitives/Text"
import { fireHaptic } from "@/utils/haptics"

import { usePlanningChangeNewScreen } from "./usePlanningChangeNewScreen"

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateString(s: string): Date {
  // Parse "yyyy-MM-dd" as local date at noon to avoid timezone shifts
  const d = new Date(`${s}T12:00:00`)
  return isNaN(d.getTime()) ? new Date() : d
}

function parseTimeString(s: string): Date {
  const [hours, minutes] = s.split(":").map(Number)
  const d = new Date()
  d.setHours(isNaN(hours) ? 9 : hours, isNaN(minutes) ? 0 : minutes, 0, 0)
  return d
}

// ── Shift picker row ──────────────────────────────────────────────────────────

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
            <Text
              size="xs"
              style={{ color: tokens.textPrimary }}
              text={formatShortDate(shift.date)}
              weight="medium"
            />
            <Text
              size="xxs"
              style={{ color: tokens.textSecondary }}
              text={getShiftTimeRange(shift)}
            />
          </View>
          {isSelected ? <Ionicons color={tokens.accent} name="checkmark-circle" size={18} /> : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

// ── Date/time picker row ──────────────────────────────────────────────────────

function PickerRow({
  isActive,
  label,
  onPress,
  value,
}: {
  isActive: boolean
  label: string
  onPress: () => void
  value: string
}) {
  const tokens = useDesignTokens()
  const pickerActiveStyle = isActive
    ? {
        backgroundColor: tokens.accentMuted,
        borderLeftColor: tokens.accent,
        borderLeftWidth: 3,
      }
    : null
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pickerRow, { borderColor: tokens.border }, pickerActiveStyle]}
    >
      <Text
        size="xxs"
        style={{ color: tokens.textMuted }}
        text={label.toUpperCase()}
        weight="medium"
      />
      <Text
        size="sm"
        style={{ color: value ? tokens.textPrimary : tokens.textMuted }}
        text={value || "—"}
      />
    </Pressable>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function PlanningChangeNewScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningChangeNewScreen()
  const { showSuccess } = useToast()

  // Local Date state for the pickers (derived from / synced to the hook strings)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  useEffect(() => {
    if (screen.success) {
      fireHaptic("success")
      showSuccess(translate("planning:requests.submitSuccess"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.success])

  const dateValue = screen.requestedDate ? parseDateString(screen.requestedDate) : new Date()
  const startValue = screen.requestedStartTime
    ? parseTimeString(screen.requestedStartTime)
    : new Date(new Date().setHours(9, 0, 0, 0))
  const endValue = screen.requestedEndTime
    ? parseTimeString(screen.requestedEndTime)
    : new Date(new Date().setHours(17, 0, 0, 0))

  if (screen.success) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <SuccessState title={translate("planning:requests.submitSuccess")}>
          <AppButton
            label={translate("common:actions.close")}
            onPress={screen.handleDismiss}
            variant="secondary"
          />
        </SuccessState>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <GroupedSection title={translate("planning:requests.changeRequest")}>
        {screen.myShifts.length === 0 && !screen.isLoading ? (
          <Text
            size="xs"
            style={[styles.emptyText, { color: tokens.textMuted }]}
            text={translate("planning:schedule.noShifts")}
          />
        ) : (
          <View style={styles.shiftList}>
            {screen.myShifts.map((shift, index) => (
              <ShiftPickerRow
                key={shift.id}
                index={index}
                isSelected={screen.selectedShiftId === shift.id}
                onSelect={() => screen.setSelectedShiftId(shift.id)}
                shift={shift}
              />
            ))}
          </View>
        )}
      </GroupedSection>

      <GroupedSection title={translate("planning:requests.desiredChange")}>
        <View style={styles.pickerStack}>
          <PickerRow
            isActive={showDatePicker}
            label={translate("planning:requests.requestedDate")}
            onPress={() => {
              setShowStartPicker(false)
              setShowEndPicker(false)
              setShowDatePicker((prev) => !prev)
            }}
            value={screen.requestedDate}
          />
          {showDatePicker ? (
            <DateTimePicker
              display="spinner"
              mode="date"
              onChange={(_, selected) => {
                if (!selected) return
                screen.setRequestedDate(formatLocalDate(selected))
              }}
              value={dateValue}
            />
          ) : null}

          <PickerRow
            isActive={showStartPicker}
            label={translate("planning:requests.requestedStartTime")}
            onPress={() => {
              setShowDatePicker(false)
              setShowEndPicker(false)
              setShowStartPicker((prev) => !prev)
            }}
            value={screen.requestedStartTime}
          />
          {showStartPicker ? (
            <DateTimePicker
              display="spinner"
              minuteInterval={5}
              mode="time"
              onChange={(_, selected) => {
                if (!selected) return
                screen.setRequestedStartTime(formatTimeLabel(selected))
              }}
              value={startValue}
            />
          ) : null}

          <PickerRow
            isActive={showEndPicker}
            label={translate("planning:requests.requestedEndTime")}
            onPress={() => {
              setShowDatePicker(false)
              setShowStartPicker(false)
              setShowEndPicker((prev) => !prev)
            }}
            value={screen.requestedEndTime}
          />
          {showEndPicker ? (
            <DateTimePicker
              display="spinner"
              minuteInterval={5}
              mode="time"
              onChange={(_, selected) => {
                if (!selected) return
                screen.setRequestedEndTime(formatTimeLabel(selected))
              }}
              value={endValue}
            />
          ) : null}
        </View>
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
        label={translate("planning:requests.changeRequest")}
        onPress={() => {
          void screen.handleSubmit()
        }}
        pressHaptic="none"
      />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    padding: 16,
  },
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
  pickerRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerStack: {
    gap: 0,
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
  textAreaInput: {
    minHeight: 64,
    textAlignVertical: "top",
  },
})
