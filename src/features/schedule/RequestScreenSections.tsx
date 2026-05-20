import { View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestCategory, Shift } from "@/core/models"
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
      contentContainerStyle={{ justifyContent: "center", minHeight: "100%", paddingBottom: insets.bottom + 30, paddingHorizontal: 20 }}
      variant="grouped"
    >
      <SuccessState subtitle={successCopy} title="Request submitted" />
      <View style={{ alignSelf: "stretch", gap: 14, paddingTop: 18 }}>
        <SurfaceCard style={{ alignSelf: "stretch", gap: 10 }}>
          <Text
            size="xxs"
            style={{ color: tokens.textSecondary }}
            text={actionCopy.screenTitle}
            weight="semiBold"
          />
          <Text size="sm" style={{ color: tokens.textPrimary }} text={summaryTarget} weight="semiBold" />
          {detailTargetLabel ? (
            <Text size="xxs" style={{ color: tokens.textSecondary }} text={detailTargetLabel} />
          ) : null}
          <Text size="xxs" style={{ color: tokens.textSecondary }} text={reason} />
        </SurfaceCard>
        <AppButton fullWidth label="Done" onPress={() => router.back()} />
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
            <View>
              {upcomingShifts.map((shift, index) => {
                const selected = selectedShiftId === shift.id

                return (
                  <SelectionRow
                    backgroundColor={selected ? tokens.accentSoft : tokens.surface}
                    dividerInset={16}
                    isLast={index === upcomingShifts.length - 1}
                    key={shift.id}
                    onPress={() => onSelectShift(shift.id)}
                    selected={selected}
                    style={{ borderRadius: 0, borderWidth: 0, minHeight: 74 }}
                    subtitle={`${formatFullDate(shift.date)} · ${shift.role} · ${shift.venueName}`}
                    title={`${shift.dayLabel} · ${getShiftTimeRange(shift)}`}
                    trailing={selected ? <SelectionIndicator /> : null}
                  />
                )
              })}
            </View>
          ) : (
            <EmptyState
              subtitle="When a shift is scheduled, you can ask for a replacement or report a conflict here."
              title="No upcoming shifts to update"
            />
          )
        ) : requestDates.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
            subtitle="Time-off requests appear here when the next planning window opens."
            title="No dates open right now"
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
  return (
    <GroupedSection bodyStyle={sectionBodyStyle} title={title}>
      <View style={groupBodyStyle}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {options.map((option) => {
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
    <GroupedSection bodyStyle={sectionBodyStyle} title="Note">
      <View style={groupBodyStyle}>
        <TextField
          caption="Optional context shown with your request."
          containerStyle={{ minHeight: 146 }}
          inputStyle={{ fontSize: 15, minHeight: 96, paddingTop: 2 }}
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
  )
}

const groupBodyStyle = { gap: 14 } as const

const sectionBodyStyle = {
  backgroundColor: "transparent",
  borderWidth: 0,
  elevation: 0,
  overflow: "visible" as const,
  padding: 0,
  shadowOpacity: 0,
}
