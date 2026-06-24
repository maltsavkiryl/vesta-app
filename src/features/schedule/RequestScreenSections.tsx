import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestCategory, Shift } from "@/core/models"
import { translate } from "@/i18n/translate"
import {
  AppButton,
  AppScrollScreen,
  EmptyState,
  GroupedSection,
  SelectionChip,
  SelectionIndicator,
  SelectionRow,
  SuccessState,
  SurfaceCard,
  Text,
  TextField,
  useDesignTokens,
} from "@/ui"

type ActionCopy = {
  reasonTitle: string
  screenTitle: string
  submitLabel: string
}

type TargetSectionCopy = {
  sectionTitle: string
  subtitle: string
}

export function RequestSuccessContent({
  actionCopy,
  detailTargetLabel,
  reason,
  summaryTarget,
  successCopy,
}: {
  actionCopy: ActionCopy
  detailTargetLabel: string
  reason: string
  successCopy: string
  summaryTarget: string
}) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.successScroll, { paddingBottom: insets.bottom + 30 }]}
      variant="grouped"
    >
      <SuccessState subtitle={successCopy} title={translate("planning:requests.submitSuccess")} />
      <View style={styles.successBody}>
        <SurfaceCard style={styles.successCard}>
          <Text
            size="xxs"
            style={{ color: tokens.textSecondary }}
            text={actionCopy.screenTitle}
            weight="semiBold"
          />
          <Text
            size="sm"
            style={{ color: tokens.textPrimary }}
            text={summaryTarget}
            weight="semiBold"
          />
          {detailTargetLabel ? (
            <Text size="xxs" style={{ color: tokens.textSecondary }} text={detailTargetLabel} />
          ) : null}
          <Text size="xxs" style={{ color: tokens.textSecondary }} text={reason} />
        </SurfaceCard>
        <AppButton
          fullWidth
          label={translate("common:actions.done")}
          onPress={() => router.back()}
        />
      </View>
    </AppScrollScreen>
  )
}

export function RequestTargetSection({
  category,
  requestDates,
  selectedDates,
  selectedShiftId,
  targetSectionCopy,
  toggleDate,
  upcomingShifts,
  onSelectShift,
}: {
  category: RequestCategory
  onSelectShift: (shiftId: string) => void
  requestDates: string[]
  selectedDates: string[]
  selectedShiftId: string
  targetSectionCopy: TargetSectionCopy
  toggleDate: (date: string) => void
  upcomingShifts: Shift[]
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection bodyStyle={sectionBodyStyle} title={targetSectionCopy.sectionTitle}>
      <View style={groupBodyStyle}>
        <Text size="xs" style={{ color: tokens.textSecondary }} text={targetSectionCopy.subtitle} />
        {category === "shift_change" ? (
          upcomingShifts.length > 0 ? (
            <SurfaceCard style={styles.shiftListCard}>
              {upcomingShifts.map((shift, index) => {
                const selected = selectedShiftId === shift.id

                return (
                  <SelectionRow
                    backgroundColor={selected ? tokens.accentSoft : tokens.surface}
                    dividerInset={16}
                    grouped
                    isLast={index === upcomingShifts.length - 1}
                    key={shift.id}
                    onPress={() => onSelectShift(shift.id)}
                    selected={selected}
                    style={styles.shiftRow}
                    subtitle={`${formatFullDate(shift.date)} · ${shift.role} · ${shift.venueName}`}
                    title={`${shift.dayLabel} · ${getShiftTimeRange(shift)}`}
                    trailing={selected ? <SelectionIndicator /> : null}
                  />
                )
              })}
            </SurfaceCard>
          ) : (
            <EmptyState
              subtitle={translate("planning:requests.noShiftsSubtitle")}
              title={translate("planning:requests.noShiftsTitle")}
            />
          )
        ) : requestDates.length > 0 ? (
          <View style={styles.chipWrap}>
            {requestDates.map((date) => (
              <SelectionChip
                key={date}
                label={formatShortDate(date)}
                onPress={() => toggleDate(date)}
                selected={selectedDates.includes(date)}
                selectedVariant="solid"
              />
            ))}
          </View>
        ) : (
          <EmptyState
            subtitle={translate("planning:requests.noDatesSubtitle")}
            title={translate("planning:requests.noDatesTitle")}
          />
        )}
      </View>
    </GroupedSection>
  )
}

export function RequestReasonSection({
  options,
  reason,
  setReason,
  title,
}: {
  options: string[]
  reason: string
  setReason: (reason: string) => void
  title: string
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection bodyStyle={sectionBodyStyle} title={title}>
      <View style={groupBodyStyle}>
        <View style={styles.chipWrap}>
          {options.map((option) => {
            const selected = option === reason
            return (
              <SelectionChip
                key={option}
                label={option}
                onPress={() => setReason(selected ? "" : option)}
                selected={selected}
                selectedVariant="solid"
                unselectedBackgroundColor={tokens.surface}
              />
            )
          })}
        </View>
      </View>
    </GroupedSection>
  )
}

export function RequestNoteSection({
  note,
  setNote,
}: {
  note: string
  setNote: (note: string) => void
}) {
  return (
    <GroupedSection bodyStyle={sectionBodyStyle} title={translate("planning:requests.noteLabel")}>
      <View style={groupBodyStyle}>
        <TextField
          caption={translate("planning:requests.noteHelper")}
          containerStyle={styles.noteContainer}
          inputStyle={styles.noteInput}
          multiline
          numberOfLines={4}
          onChangeText={setNote}
          placeholder={translate("planning:requests.managerNotePlaceholder")}
          textAlignVertical="top"
          value={note}
          variant="default"
        />
      </View>
    </GroupedSection>
  )
}

const groupBodyStyle = { gap: 14 } as const

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  noteContainer: {
    minHeight: 146,
  },
  noteInput: {
    fontSize: 15,
    minHeight: 96,
    paddingTop: 2,
  },
  shiftListCard: {
    gap: 0,
    overflow: "hidden",
    padding: 0,
  },
  shiftRow: {
    minHeight: 74,
  },
  successBody: {
    alignSelf: "stretch",
    gap: 14,
    paddingTop: 18,
  },
  successCard: {
    alignSelf: "stretch",
    gap: 10,
  },
  successScroll: {
    justifyContent: "center",
    minHeight: "100%",
    paddingHorizontal: 20,
  },
})

const sectionBodyStyle = {
  backgroundColor: "transparent",
  borderWidth: 0,
  elevation: 0,
  overflow: "visible" as const,
  padding: 0,
  shadowOpacity: 0,
}
