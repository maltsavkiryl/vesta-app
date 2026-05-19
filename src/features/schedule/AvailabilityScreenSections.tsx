import { Platform, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"

import { formatFullDate } from "@/core/date"
import type { AvailabilityStatus } from "@/core/models"
import {
  availabilityStatusOptions,
  durationLabel,
  formatTimeLabel,
  timeValueToDate,
  type AvailabilityTimeField,
} from "@/features/schedule/availability.utils"
import {
  DetailRow,
  GroupedSection,
  ListRow,
  SelectionIndicator,
  SelectionRow,
  Text,
  useDesignTokens,
} from "@/ui"

const availabilityStatusIcons: Record<AvailabilityStatus, keyof typeof Ionicons.glyphMap> = {
  available: "checkmark-circle-outline",
  preferred: "star-outline",
  unavailable: "remove-circle-outline",
}

function getStatusColor(status: AvailabilityStatus, tokens: ReturnType<typeof useDesignTokens>) {
  const tone = availabilityStatusOptions[status].tone

  if (tone === "success") return tokens.success
  if (tone === "accent") return tokens.accent
  return tokens.textSecondary
}

function AvailabilityTimeValue({ value }: { value: string }) {
  const tokens = useDesignTokens()

  return (
    <Text
      size="xs"
      style={{ color: tokens.accent }}
      text={formatTimeLabel(value)}
      weight="semiBold"
    />
  )
}

export function AvailabilityIntro({ date, weekdayLabel }: { date: string; weekdayLabel: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.intro}>
      <Text
        style={[styles.introTitle, { color: tokens.textPrimary }]}
        text={formatFullDate(date)}
        weight="bold"
      />
      <Text
        size="xs"
        style={{ color: tokens.textSecondary }}
        text={`Override your ${weekdayLabel} template for this specific date.`}
      />
    </View>
  )
}

export function AvailabilityTemplateSection({
  existingOverride,
  templateDay,
}: {
  existingOverride?: object
  templateDay: { endTime: string; startTime: string; status: AvailabilityStatus }
}) {
  const tokens = useDesignTokens()
  const summary = `${availabilityStatusOptions[templateDay.status].label} · ${formatTimeLabel(templateDay.startTime)} to ${formatTimeLabel(templateDay.endTime)}`

  return (
    <GroupedSection title="Default for this weekday">
      <ListRow
        isLast
        leading={
          <View style={[styles.summaryGlyph, { backgroundColor: tokens.accentSoft }]}>
            <Ionicons color={tokens.accent} name="repeat-outline" size={18} />
          </View>
        }
        subtitle={
          existingOverride
            ? "A date-specific override is active."
            : "No override yet. Save to customize this date."
        }
        title={summary}
      />
    </GroupedSection>
  )
}

export function AvailabilityStatusSection({
  onSelectStatus,
  status,
}: {
  onSelectStatus: (status: AvailabilityStatus) => void
  status: AvailabilityStatus
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection title="Availability status">
      {(Object.keys(availabilityStatusOptions) as AvailabilityStatus[]).map(
        (candidate, index, items) => {
          const option = availabilityStatusOptions[candidate]
          const active = candidate === status
          const activeColor = getStatusColor(candidate, tokens)

          return (
            <SelectionRow
              key={candidate}
              backgroundColor={tokens.transparent}
              dividerInset={58}
              grouped
              isLast={index === items.length - 1}
              leading={
                <View style={[styles.statusGlyph, { backgroundColor: `${activeColor}1A` }]}>
                  <Ionicons
                    color={activeColor}
                    name={availabilityStatusIcons[candidate]}
                    size={18}
                  />
                </View>
              }
              onPress={() => onSelectStatus(candidate)}
              selected={active}
              style={styles.statusRow}
              subtitle={option.description}
              title={option.label}
              trailing={active ? <SelectionIndicator /> : null}
            />
          )
        },
      )}
    </GroupedSection>
  )
}

export function AvailabilityHoursSection({
  activeTimeField,
  endTime,
  onAndroidTimeChange,
  onPressTime,
  pickerValue,
  startTime,
}: {
  activeTimeField: AvailabilityTimeField | null
  endTime: string
  onAndroidTimeChange: (event: DateTimePickerEvent, selectedDate?: Date) => void
  onPressTime: (field: AvailabilityTimeField) => void
  pickerValue: string
  startTime: string
}) {
  return (
    <GroupedSection title="Working hours">
      <ListRow
        subtitle="When you can start"
        title="From"
        trailing={<AvailabilityTimeValue value={startTime} />}
        onPress={() => onPressTime("startTime")}
      />
      <ListRow
        subtitle="When you can finish"
        title="To"
        trailing={<AvailabilityTimeValue value={endTime} />}
        onPress={() => onPressTime("endTime")}
      />
      <DetailRow isLast label="Total span" value={durationLabel(startTime, endTime)} />
      {activeTimeField && Platform.OS === "android" ? (
        <DateTimePicker
          display="default"
          minuteInterval={15}
          mode="time"
          onChange={onAndroidTimeChange}
          value={timeValueToDate(pickerValue)}
        />
      ) : null}
    </GroupedSection>
  )
}

const styles = StyleSheet.create({
  intro: {
    gap: 6,
  },
  introTitle: {
    fontSize: 24,
  },
  statusGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  statusRow: {
    borderWidth: 0,
    paddingHorizontal: 14,
  },
  summaryGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
})
