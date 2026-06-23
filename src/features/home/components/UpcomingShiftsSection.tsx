import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"

import type { Shift } from "@/core/models"
import { translate } from "@/i18n/translate"
import { EmptyState, SectionBlock, Text, useDesignTokens } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"
import { useListItemEntrance } from "@/ui/foundations/motion"

function UpcomingShiftCard({
  index,
  shift,
  onPress,
}: {
  index: number
  shift: Shift
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: pressStyle, pressHandlers } = usePressScale({ pressedScale: 0.975 })
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 30, step: 40 })
  const dayNumber = shift.date.split("-")[2]

  return (
    <Animated.View style={[entranceStyle, pressStyle]}>
      <Pressable
        onPress={onPress}
        {...pressHandlers}
        style={[
          styles.upcomingCard,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
            ...tokens.elevation1,
          },
        ]}
      >
        <View style={styles.upcomingHeader}>
          <Text
            text={shift.dayLabel}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textMuted }}
          />
        </View>

        <Text
          text={dayNumber}
          weight="bold"
          style={[styles.dayNumber, { color: tokens.textPrimary }]}
        />

        <View style={styles.copyStack}>
          <Text
            text={`${shift.startTime} - ${shift.endTime}`}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textSecondary }}
          />

          <Text
            text={shift.venueName}
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textMuted }}
          />
        </View>
      </Pressable>
    </Animated.View>
  )
}

export function UpcomingShiftsSection({
  shifts,
  onShiftPress,
  onViewAll,
}: {
  shifts: Shift[]
  onShiftPress: (shift: Shift) => void
  onViewAll: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <SectionBlock
      title={translate("home:upcoming.title")}
      actionLabel={translate("home:upcoming.viewAll")}
      onAction={onViewAll}
    >
      {shifts.length > 0 ? (
        <View style={styles.upcomingRail}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.upcomingList}
            showsHorizontalScrollIndicator={false}
          >
            {shifts.map((shift, index) => (
              <View
                key={shift.id}
                style={index === shifts.length - 1 ? undefined : styles.upcomingSeparator}
              >
                <UpcomingShiftCard
                  index={index}
                  shift={shift}
                  onPress={() => onShiftPress(shift)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <EmptyState
          icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
          subtitle={translate("home:upcoming.emptySubtitle")}
          title={translate("home:upcoming.empty")}
        />
      )}
    </SectionBlock>
  )
}

const styles = StyleSheet.create({
  copyStack: {
    gap: 6,
    marginTop: "auto",
  },
  dayNumber: {
    fontSize: 32,
    lineHeight: 36,
    marginTop: 10,
  },
  upcomingCard: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 156,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: 136,
  },
  upcomingHeader: {
    marginBottom: 2,
  },
  upcomingList: {
    paddingBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  upcomingRail: {
    marginHorizontal: -16,
  },
  upcomingSeparator: {
    marginRight: 10,
  },
})
