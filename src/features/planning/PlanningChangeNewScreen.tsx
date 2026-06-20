/* eslint-disable react-native/no-inline-styles */

import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Shift } from "@/core/models"
import { AppButton, AppScrollScreen, GroupedSection, SurfaceCard, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"
import { getShiftTimeRange, formatShortDate } from "@/core/date"
import { usePlanningChangeNewScreen } from "./usePlanningChangeNewScreen"

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

export function PlanningChangeNewScreen() {
  const tokens = useDesignTokens()
  const screen = usePlanningChangeNewScreen()

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

      <GroupedSection title="Gewenste wijziging (optioneel)">
        <View style={styles.fieldBody}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={screen.setRequestedDate}
            placeholder="Datum (jjjj-mm-dd)"
            placeholderTextColor={tokens.textMuted}
            style={[styles.textInput, { color: tokens.textPrimary, borderColor: tokens.border }]}
            value={screen.requestedDate}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={screen.setRequestedStartTime}
            placeholder="Starttijd (UU:mm)"
            placeholderTextColor={tokens.textMuted}
            style={[styles.textInput, { color: tokens.textPrimary, borderColor: tokens.border }]}
            value={screen.requestedStartTime}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={screen.setRequestedEndTime}
            placeholder="Eindtijd (UU:mm)"
            placeholderTextColor={tokens.textMuted}
            style={[styles.textInput, { color: tokens.textPrimary, borderColor: tokens.border }]}
            value={screen.requestedEndTime}
          />
        </View>
      </GroupedSection>

      <GroupedSection title="Notitie (optioneel)">
        <View style={styles.fieldBody}>
          <TextInput
            multiline
            numberOfLines={3}
            onChangeText={screen.setNote}
            placeholder="Toelichting…"
            placeholderTextColor={tokens.textMuted}
            style={[styles.textArea, { color: tokens.textPrimary, borderColor: tokens.border }]}
            value={screen.note}
          />
        </View>
      </GroupedSection>

      {screen.error ? (
        <View style={[styles.errorRow, { backgroundColor: `${tokens.danger}10` }]}>
          <Ionicons color={tokens.danger} name="alert-circle-outline" size={14} />
          <Text size="xxs" style={{ color: tokens.danger }} text={screen.error} />
        </View>
      ) : null}

      <AppButton
        disabled={!screen.canSubmit || screen.isSubmitting}
        fullWidth
        label={screen.isSubmitting ? "Indienen…" : translate("planning:requests.changeRequest")}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  textArea: {
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  textInput: {
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    paddingHorizontal: 12,
  },
})
