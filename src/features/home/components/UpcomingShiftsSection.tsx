import { FlatList, Pressable, StyleSheet, View } from "react-native"

import type { Shift } from "@/core/models"
import { SectionBlock, Text, useDesignTokens } from "@/ui"

function UpcomingShiftCard({ shift, onPress }: { shift: Shift; onPress: () => void }) {
  const tokens = useDesignTokens()
  const dayNumber = shift.date.split("-")[2]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.upcomingCard,
        {
          backgroundColor: pressed ? tokens.backgroundMuted : tokens.surface,
          borderColor: tokens.border,
          shadowColor: tokens.shadow,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={styles.upcomingHeader}>
        <Text text={shift.dayLabel} size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
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

        <View
          style={[
            styles.rolePill,
            {
              backgroundColor: tokens.surfaceSecondary,
              borderColor: tokens.transparent,
            },
          ]}
        >
          <Text
            text={shift.role}
            numberOfLines={1}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
        </View>
      </View>
    </Pressable>
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
  return (
    <SectionBlock title="Upcoming" actionLabel="View all" onAction={onViewAll}>
      <FlatList
        data={shifts}
        horizontal
        contentContainerStyle={styles.upcomingList}
        keyExtractor={(shift) => shift.id}
        renderItem={({ item }) => (
          <UpcomingShiftCard shift={item} onPress={() => onShiftPress(item)} />
        )}
        showsHorizontalScrollIndicator={false}
      />
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
  rolePill: {
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  upcomingCard: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    minHeight: 156,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    width: 136,
  },
  upcomingHeader: {
    marginBottom: 2,
  },
  upcomingList: {
    gap: 10,
    paddingBottom: 6,
    paddingTop: 2,
  },
})
