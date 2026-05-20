import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"
import { durationLabel } from "@/features/schedule/availability.utils"
import {
  getAvailabilityTemplateStatusTone,
  getAvailabilityTemplateSummary,
} from "@/features/schedule/availability-template.utils"
import { availabilityWeekdayLabels, availabilityWeekdays } from "@/features/schedule/schedule.utils"
import { GroupedSection, SelectionRow, Text, useDesignTokens } from "@/ui"

export function AvailabilityTemplateIntro() {
  const tokens = useDesignTokens()

  return (
    <View style={styles.intro}>
      <Text
        size="xs"
        style={{ color: tokens.textSecondary }}
        text="Set your usual pattern here, then adjust specific dates only when something changes."
      />
    </View>
  )
}

export function AvailabilityTemplateWeekdaySection({
  onPressDay,
  template,
}: {
  onPressDay: (weekday: AvailabilityWeekday) => void
  template: AvailabilityTemplate
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection>
      {availabilityWeekdays.map((weekday, index) => {
        const day = template[weekday]
        const statusColor = getAvailabilityTemplateStatusTone(day.status, tokens)
        const statusSummary = getAvailabilityTemplateSummary(day)

        return (
          <SelectionRow
            key={weekday}
            backgroundColor={tokens.transparent}
            dividerInset={58}
            grouped
            isLast={index === availabilityWeekdays.length - 1}
            leading={
              <View style={styles.weekdayLeading}>
                <View
                  style={[
                    styles.weekdayStatusDot,
                    {
                      backgroundColor: statusColor,
                      opacity: day.status === "unavailable" ? 0.7 : 1,
                    },
                  ]}
                />
              </View>
            }
            onPress={() => onPressDay(weekday)}
            selected={false}
            style={styles.weekdayRow}
            subtitle={statusSummary}
            title={availabilityWeekdayLabels[weekday]}
            trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
          />
        )
      })}
    </GroupedSection>
  )
}

export function AvailabilityTemplateTotalSpan({
  endTime,
  startTime,
}: {
  endTime: string
  startTime: string
}) {
  const tokens = useDesignTokens()

  return (
    <Text
      size="xxs"
      style={{ color: tokens.textMuted, textAlign: "center" }}
      text={`Total span ${durationLabel(startTime, endTime)}`}
      weight="medium"
    />
  )
}

const styles = StyleSheet.create({
  intro: {
    gap: 6,
  },
  weekdayLeading: {
    alignItems: "center",
    justifyContent: "center",
    width: 10,
  },
  weekdayRow: {
    borderWidth: 0,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  weekdayStatusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
})
