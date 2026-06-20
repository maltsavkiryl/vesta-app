/* eslint-disable react-native/no-inline-styles */

import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import type { Shift } from "@/core/models"
import { AppButton, AppScrollScreen, GroupedSection, SurfaceCard, TextField, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"
import { getShiftTimeRange, formatShortDate } from "@/core/date"
import { usePlanningChangeNewScreen } from "./usePlanningChangeNewScreen"

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

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
  isSelected,
  onSelect,
  shift,
}: {
  isSelected: boolean
  onSelect: () => void
  shift: Shift
}) {
  const tokens = useDesignTokens()
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.shiftRow,
        {
          borderColor: isSelected ? tokens.accent : tokens.border,
          opacity: pressed ? 0.7 : 1,
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
  )
}

// ── Date/time picker row ──────────────────────────────────────────────────────

function PickerRow({
  label,
  onPress,
  value,
}: {
  label: string
  onPress: () => void
  value: string
}) {
  const tokens = useDesignTokens()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerRow,
        { borderColor: tokens.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text size="xxs" style={{ color: tokens.textMuted }} text={label.toUpperCase()} weight="medium" />
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

  // Local Date state for the pickers (derived from / synced to the hook strings)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const dateValue = screen.requestedDate
    ? parseDateString(screen.requestedDate)
    : new Date()
  const startValue = screen.requestedStartTime
    ? parseTimeString(screen.requestedStartTime)
    : new Date(new Date().setHours(9, 0, 0, 0))
  const endValue = screen.requestedEndTime
    ? parseTimeString(screen.requestedEndTime)
    : new Date(new Date().setHours(17, 0, 0, 0))

  if (screen.success) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <SurfaceCard style={styles.successCard}>
          <Ionicons color={tokens.success} name="checkmark-circle" size={32} />
          <Text
            size="sm"
            style={{ color: tokens.success }}
            text={translate("planning:requests.submitSuccess")}
            weight="semiBold"
          />
          <AppButton label={translate("common:actions.close")} onPress={screen.handleDismiss} variant="secondary" />
        </SurfaceCard>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <GroupedSection title={translate("planning:requests.changeRequest")}>
        {screen.myShifts.length === 0 && !screen.isLoading ? (
          <Text size="xs" style={{ color: tokens.textMuted, padding: 16 }} text={translate("planning:schedule.noShifts")} />
        ) : (
          <View style={styles.shiftList}>
            {screen.myShifts.map((shift) => (
              <ShiftPickerRow
                key={shift.id}
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
                screen.setRequestedDate(toDateString(selected))
              }}
              value={dateValue}
            />
          ) : null}

          <PickerRow
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
                screen.setRequestedStartTime(toTimeString(selected))
              }}
              value={startValue}
            />
          ) : null}

          <PickerRow
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
                screen.setRequestedEndTime(toTimeString(selected))
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
        <View style={[styles.errorRow, { backgroundColor: `${tokens.danger}10` }]}>
          <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
          <Text size="xxs" style={{ color: tokens.danger }} text={screen.error} />
        </View>
      ) : null}

      <AppButton
        disabled={!screen.canSubmit || screen.isSubmitting}
        fullWidth
        label={screen.isSubmitting ? translate("planning:requests.submitting") : translate("planning:requests.changeRequest")}
        onPress={() => {
          void screen.handleSubmit()
        }}
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
  successCard: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  textAreaInput: {
    minHeight: 64,
    textAlignVertical: "top",
  },
})
