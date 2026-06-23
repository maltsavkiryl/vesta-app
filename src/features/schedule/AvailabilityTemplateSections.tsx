import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"

import type { AvailabilityTemplate, AvailabilityWeekday } from "@/core/models"
import { getAvailabilityTemplateSummary } from "@/features/schedule/availability-template.utils"
import { durationLabel } from "@/features/schedule/availability.utils"
import { availabilityWeekdayLabels, availabilityWeekdays } from "@/features/schedule/schedule.utils"
import { GroupedSection, SelectionRow, Text, useDesignTokens } from "@/ui"
import { useListItemEntrance } from "@/ui/foundations/motion"

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
        const statusSummary = getAvailabilityTemplateSummary(day)

        // Use richer semantic colors based on status
        const dotColor =
          day.status === "available"
            ? tokens.success
            : day.status === "preferred"
              ? tokens.accent
              : tokens.textMuted

        // Time-range subtitle for available/preferred days
        const timeSubtitle =
          day.status !== "unavailable" && day.startTime && day.endTime
            ? `${day.startTime} – ${day.endTime}`
            : statusSummary

        return (
          <WeekdayRow
            key={weekday}
            dotColor={dotColor}
            index={index}
            isLast={index === availabilityWeekdays.length - 1}
            onPress={() => onPressDay(weekday)}
            subtitle={timeSubtitle}
            tokens={tokens}
            weekday={weekday}
          />
        )
      })}
    </GroupedSection>
  )
}

function WeekdayRow({
  dotColor,
  index,
  isLast,
  onPress,
  subtitle,
  tokens,
  weekday,
}: {
  dotColor: string
  index: number
  isLast: boolean
  onPress: () => void
  subtitle: string
  tokens: ReturnType<typeof useDesignTokens>
  weekday: AvailabilityWeekday
}) {
  const { animatedStyle } = useListItemEntrance(index, { baseDelay: 30, step: 40 })

  return (
    <Animated.View style={animatedStyle}>
      <SelectionRow
        backgroundColor={tokens.transparent}
        dividerInset={58}
        grouped
        isLast={isLast}
        leading={
          <View style={styles.weekdayLeading}>
            <View style={[styles.weekdayStatusDot, { backgroundColor: dotColor }]} />
          </View>
        }
        onPress={onPress}
        selected={false}
        style={styles.weekdayRow}
        subtitle={subtitle}
        title={availabilityWeekdayLabels[weekday]}
        trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
      />
    </Animated.View>
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
      style={[styles.centerText, { color: tokens.textMuted }]}
      text={`Total span ${durationLabel(startTime, endTime)}`}
      weight="medium"
    />
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  intro: {
    gap: 6,
  },
  weekdayLeading: {
    alignItems: "center",
    justifyContent: "center",
    width: 14,
  },
  weekdayRow: {
    borderWidth: 0,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  weekdayStatusDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
})
