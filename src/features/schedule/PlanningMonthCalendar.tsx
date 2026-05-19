import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatMonthLabel } from "@/core/date"
import type { CalendarDayState } from "@/features/schedule/schedule.utils"
import { Text, useDesignTokens } from "@/ui"

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"] as const

function getAvailabilityColor(
  availabilityStatus: CalendarDayState["availabilityStatus"],
  colors: ReturnType<typeof useDesignTokens>,
) {
  if (availabilityStatus === "preferred") return colors.accent
  if (availabilityStatus === "available") return colors.success
  return colors.textMuted
}

export function PlanningMonthCalendar({
  anchorDate,
  cells,
  getDayState,
  onNextMonth,
  onPrevMonth,
  onSelectDate,
  selectedDate,
}: {
  anchorDate: Date
  cells: Array<string | null>
  getDayState: (dateString: string) => CalendarDayState
  onNextMonth: () => void
  onPrevMonth: () => void
  onSelectDate: (dateString: string) => void
  selectedDate: string
}) {
  const tokens = useDesignTokens()
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = anchorDate.getMonth()

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={onPrevMonth}
          style={[styles.monthButton, { backgroundColor: tokens.surfaceSecondary }]}
        >
          <Ionicons color={tokens.textPrimary} name="chevron-back-outline" size={16} />
        </Pressable>
        <Text
          text={formatMonthLabel(anchorDate.toISOString())}
          size="sm"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onNextMonth}
          style={[styles.monthButton, { backgroundColor: tokens.surfaceSecondary }]}
        >
          <Ionicons color={tokens.textPrimary} name="chevron-forward-outline" size={16} />
        </Pressable>
      </View>

      <View style={styles.dayLabelRow}>
        {dayLabels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.dayLabelCell}>
            <Text text={label} size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((dateString, index) => {
          if (!dateString) {
            return <View key={`empty-${index}`} style={styles.emptyCell} />
          }

          const dayState = getDayState(dateString)
          const date = new Date(`${dateString}T12:00:00`)
          const isSelected = dateString === selectedDate
          const isToday = dateString === today
          const isCurrentMonth = date.getMonth() === currentMonth
          const availabilityColor = getAvailabilityColor(dayState.availabilityStatus, tokens)
          const indicators = [
            dayState.hasShift ? (
              <View
                key="shift"
                style={[
                  styles.shiftIndicator,
                  { backgroundColor: isSelected ? tokens.accentForeground : tokens.accent },
                ]}
              />
            ) : null,
            <View
              key="availability"
              style={[
                styles.availabilityIndicator,
                {
                  backgroundColor: isSelected
                    ? tokens.accentForeground
                    : dayState.availabilityStatus === "unavailable"
                      ? tokens.textMuted
                      : availabilityColor,
                },
              ]}
            />,
            dayState.hasOverride ? (
              <View
                key="override"
                style={[
                  styles.overrideIndicator,
                  {
                    backgroundColor: isSelected
                      ? tokens.accentForeground
                      : tokens.textSecondary,
                  },
                ]}
              />
            ) : null,
          ].filter(Boolean)
          const containerColor = dayState.needsResponse
            ? `${tokens.warning}12`
            : dayState.hasShift
              ? `${tokens.accent}10`
              : dayState.availabilityStatus === "unavailable"
                ? tokens.surfaceSecondary
                : `${availabilityColor}10`

          return (
            <Pressable
              key={dateString}
              accessibilityRole="button"
              onPress={() => onSelectDate(dateString)}
              style={[
                styles.dayCell,
                {
                  backgroundColor: isSelected ? tokens.accent : containerColor,
                  borderColor: isSelected
                    ? tokens.accent
                    : isToday
                      ? tokens.accent
                      : dayState.needsResponse
                        ? `${tokens.warning}30`
                        : "transparent",
                },
              ]}
            >
              <View style={styles.dayTopRow}>
                <Text
                  text={String(date.getDate())}
                  size="xs"
                  weight={isSelected || isToday ? "semiBold" : "medium"}
                  style={{
                    color: isSelected
                      ? tokens.accentForeground
                      : isCurrentMonth
                        ? tokens.textPrimary
                        : tokens.textMuted,
                  }}
                />
                {dayState.needsResponse ? (
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isSelected ? tokens.accentForeground : tokens.warning,
                      },
                    ]}
                  />
                ) : null}
              </View>

              <View style={styles.indicatorRow}>
                {indicators.map((indicator, indicatorIndex) => (
                  <View key={indicatorIndex}>{indicator}</View>
                ))}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  availabilityIndicator: {
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  card: {
    gap: 12,
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: "12.5%",
    justifyContent: "center",
    maxWidth: "12.5%",
    minHeight: 42,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  dayLabelCell: {
    alignItems: "center",
    flex: 1,
  },
  dayLabelRow: {
    flexDirection: "row",
  },
  dayTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  emptyCell: {
    aspectRatio: 1,
    flexBasis: "12.5%",
    maxWidth: "12.5%",
    minHeight: 42,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  indicatorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    minHeight: 6,
  },
  monthButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  overrideIndicator: {
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  shiftIndicator: {
    borderRadius: 999,
    height: 4,
    width: 10,
  },
  statusDot: {
    borderRadius: 999,
    height: 5,
    width: 5,
  },
})
