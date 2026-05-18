/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { FlatList, Pressable, StyleSheet, View } from "react-native"

import type { Shift, ShiftStatus } from "@/core/models"
import { SectionBlock, Text, useDesignTokens } from "@/ui"
import type { DesignTokens } from "@/ui"

function getStatusColor(tokens: DesignTokens, status: ShiftStatus) {
  return {
    changed: tokens.warning,
    confirmed: tokens.success,
    pending: tokens.textMuted,
  }[status]
}

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
          borderColor: tokens.isDark ? tokens.border : "#DCDDE4",
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View style={styles.upcomingMeta}>
        <Text
          text={shift.dayLabel}
          size="xxs"
          weight="medium"
          style={{ color: tokens.textMuted }}
        />
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor(tokens, shift.status) }]}
        />
      </View>
      <Text
        text={dayNumber}
        weight="bold"
        style={[styles.dayNumber, { color: tokens.textPrimary }]}
      />
      <Text text={shift.startTime} size="xxs" style={{ color: tokens.textSecondary }} />
      <View style={[styles.rolePill, { backgroundColor: tokens.surfaceSecondary }]}>
        <Text
          text={shift.role}
          numberOfLines={1}
          size="xxs"
          weight="medium"
          style={{ color: tokens.textSecondary }}
        />
      </View>
    </Pressable>
  )
}

export function UpcomingShiftsSection({
  shifts,
  onShiftPress,
  onSeeAll,
}: {
  shifts: Shift[]
  onShiftPress: (shift: Shift) => void
  onSeeAll: () => void
}) {
  return (
    <SectionBlock title="Upcoming" actionLabel="See all" onAction={onSeeAll}>
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
  dayNumber: {
    fontSize: 26,
    lineHeight: 28,
  },
  rolePill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    marginTop: 6,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  upcomingCard: {
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    minHeight: 116,
    paddingHorizontal: 10,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    width: 112,
  },
  upcomingList: {
    gap: 9,
    paddingBottom: 4,
    paddingTop: 2,
  },
  upcomingMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
})
