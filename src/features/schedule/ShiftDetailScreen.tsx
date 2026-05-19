/* eslint-disable react-native/no-inline-styles */

import { Pressable, StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, getShiftTimeRange } from "@/core/date"
import type { Shift } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

function getStatusColor(tokens: ReturnType<typeof useDesignTokens>, shift: Shift) {
  if (shift.requiresResponse) return tokens.warning
  return shift.status === "confirmed"
    ? tokens.success
    : shift.status === "changed"
      ? tokens.warning
      : tokens.textMuted
}

function InfoPill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.infoPill, { backgroundColor: tokens.surfaceSecondary }]}>
      <Ionicons color={tokens.textSecondary} name={icon} size={13} />
      <Text text={text} size="xxs" weight="medium" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

export function ShiftDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const { state } = useScheduleStateQuery()
  const { respondToShift } = useScheduleActions()
  const shift = state?.shifts.find((item) => item.id === id)

  if (!shift) {
    return (
      <AppScrollScreen
        contentContainerStyle={styles.screen}
        style={{ backgroundColor: tokens.groupedBackground }}
      >
        <Text
          text="Shift not found"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 24 }}
        />
      </AppScrollScreen>
    )
  }

  const statusColor = getStatusColor(tokens, shift)

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}16` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text
              text={shift.requiresResponse ? "Needs response" : shift.status}
              size="xxs"
              weight="semiBold"
              style={{ color: statusColor }}
            />
          </View>
          <Text
            text={shift.role}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={1}
          text={getShiftTimeRange(shift)}
          weight="bold"
          style={[styles.heroTime, { color: tokens.textPrimary }]}
        />
        <Text text={formatFullDate(shift.date)} size="xs" style={{ color: tokens.textSecondary }} />
        <View style={styles.infoRow}>
          <InfoPill icon="business-outline" text={shift.venueName} />
          <InfoPill icon="location-outline" text="Open in Maps" />
        </View>
        {shift.changeSummary ? (
          <View
            style={[
              styles.callout,
              { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}25` },
            ]}
          >
            <Ionicons color={tokens.warning} name="sparkles-outline" size={16} />
            <View style={styles.flex}>
              <Text
                text="What changed"
                size="xxs"
                weight="semiBold"
                style={{ color: tokens.warning }}
              />
              <Text text={shift.changeSummary} size="xxs" style={{ color: tokens.textPrimary }} />
            </View>
          </View>
        ) : null}
      </SurfaceCard>

      {shift.requiresResponse ? (
        <GroupedSection title="Action needed">
          <View style={styles.groupBody}>
            <Text
              text="Your manager is waiting for a response on this update before the rota is locked."
              size="xs"
              style={{ color: tokens.textSecondary }}
            />
            <AppButton
              label="Acknowledge update"
              onPress={async () => {
                const result = await respondToShift(shift.id)
                if (!result.ok) return
              }}
            />
          </View>
        </GroupedSection>
      ) : null}

      <GroupedSection title="Plan for this shift">
        <View style={styles.groupBody}>
          <View style={styles.detailRow}>
            <Text text="Venue" size="xs" style={{ color: tokens.textSecondary }} />
            <Text
              text={`${shift.venueName} · ${shift.venueAddress}`}
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary, flex: 1, textAlign: "right" }}
            />
          </View>
          <View style={styles.detailRow}>
            <Text text="Duration" size="xs" style={{ color: tokens.textSecondary }} />
            <Text
              text={getShiftTimeRange(shift)}
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary }}
            />
          </View>
          <View style={styles.detailRow}>
            <Text text="Team" size="xs" style={{ color: tokens.textSecondary }} />
            <Text
              text={shift.coworkers?.join(", ") ?? "To be confirmed"}
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary, flex: 1, textAlign: "right" }}
            />
          </View>
        </View>
      </GroupedSection>

      {shift.note ? (
        <GroupedSection title="Manager note">
          <View style={styles.groupBody}>
            <Text text={shift.note} size="xs" style={{ color: tokens.textPrimary }} />
          </View>
        </GroupedSection>
      ) : null}

      <GroupedSection title="Need a change?">
        <View style={styles.actionStack}>
          <Pressable
            onPress={() =>
              router.push(`/(app)/request?category=shift_change&shiftId=${shift.id}` as never)
            }
            style={[
              styles.actionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />
            <View style={styles.flex}>
              <Text
                text="Need replacement help"
                size="xs"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text="Start a shift change request from this shift"
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
            <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/request?category=time_off" as never)}
            style={[
              styles.actionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />
            <View style={styles.flex}>
              <Text
                text="Request time off"
                size="xs"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text="Use this if the whole day no longer works for you"
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
            <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
          </Pressable>
        </View>
      </GroupedSection>

      {shift.dayLabel === "Today" ? (
        <AppButton label="Open Time" onPress={() => router.push("/(app)/(tabs)/time" as never)} />
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  actionCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionStack: {
    gap: 10,
  },
  callout: {
    alignItems: "flex-start",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  flex: {
    flex: 1,
  },
  groupBody: {
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroCard: {
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroTime: {
    flexShrink: 1,
    fontSize: 28,
    lineHeight: 34,
  },
  infoPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  screen: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
})
