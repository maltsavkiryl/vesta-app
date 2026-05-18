/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { getShiftTimeRange } from "@/core/date"
import type { Shift } from "@/core/models"
import { InCardActionButton, StatusBadge, Text, useDesignTokens } from "@/ui"

export function NextShiftHeroCard({
  shift,
  onClockIn,
  onDetails,
}: {
  shift: Shift
  onClockIn: () => void
  onDetails: () => void
}) {
  const tokens = useDesignTokens()
  const mutedText = tokens.isDark ? "rgba(255, 255, 255, 0.56)" : "rgba(255, 255, 255, 0.50)"
  const faintText = tokens.isDark ? "rgba(255, 255, 255, 0.42)" : "rgba(255, 255, 255, 0.34)"
  const panelColor = tokens.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.06)"

  return (
    <View
      style={[styles.heroCard, { backgroundColor: tokens.isDark ? tokens.surface : "#1C1C1E" }]}
    >
      <View style={styles.heroRingLarge} />
      <View style={styles.heroRingSmall} />

      <View style={styles.heroTop}>
        <View style={styles.flex}>
          <Text
            text="TODAY'S SHIFT"
            size="xxs"
            weight="semiBold"
            style={[styles.capsLabel, { color: faintText }]}
          />
          <Text
            text={getShiftTimeRange(shift)}
            weight="bold"
            style={[styles.heroTime, { color: "#FFFFFF" }]}
          />
          <Text
            text={`${shift.role} · Evening shift`}
            size="xxs"
            style={{ color: mutedText, marginTop: 2 }}
          />
        </View>
        <StatusBadge label="Confirmed" tone="success" />
      </View>

      <Pressable onPress={onDetails} style={[styles.locationRow, { backgroundColor: panelColor }]}>
        <Ionicons color={faintText} name="location-outline" size={14} />
        <Text
          text={`${shift.venueName} · ${shift.venueAddress}`}
          numberOfLines={1}
          size="xxs"
          style={[styles.flex, { color: mutedText }]}
        />
        <Ionicons color={faintText} name="navigate-outline" size={13} />
      </Pressable>

      <View style={styles.clockNotice}>
        <Ionicons color={tokens.warning} name="flash-outline" size={12} />
        <Text
          text="Clock-in opens at 16:45 · 3h away"
          size="xxs"
          weight="medium"
          style={{ color: tokens.warning }}
        />
      </View>

      <View style={styles.heroActions}>
        <InCardActionButton label="Clock in" onPress={onClockIn} />
        <Pressable
          onPress={onDetails}
          style={[styles.detailsButton, { backgroundColor: panelColor }]}
        >
          <Text text="View details" size="xs" weight="medium" style={{ color: "#FFFFFFCC" }} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  capsLabel: {
    letterSpacing: 0,
  },
  clockNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
    paddingLeft: 2,
  },
  detailsButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  flex: {
    flex: 1,
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
  },
  heroCard: {
    borderCurve: "continuous",
    borderRadius: 22,
    gap: 14,
    overflow: "hidden",
    padding: 20,
  },
  heroRingLarge: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 100,
    borderWidth: 1,
    height: 200,
    position: "absolute",
    right: -60,
    top: -60,
    width: 200,
  },
  heroRingSmall: {
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 65,
    borderWidth: 1,
    height: 130,
    position: "absolute",
    right: -30,
    top: -30,
    width: 130,
  },
  heroTime: {
    fontSize: 24,
    lineHeight: 28,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  locationRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
})
