/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, getShiftTimeRange } from "@/core/date"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  ActionRow,
  AppButton,
  AppScrollScreen,
  DetailRow,
  GroupedSection,
  MetaPill,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

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

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <StatusBadge
            label={shift.requiresResponse ? "Needs response" : shift.status}
            tone={
              shift.requiresResponse
                ? "warning"
                : shift.status === "confirmed"
                  ? "success"
                  : "neutral"
            }
          />
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
          <MetaPill
            label={shift.venueName}
            leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={13} />}
          />
          <MetaPill
            label="Open in Maps"
            leading={<Ionicons color={tokens.textSecondary} name="location-outline" size={13} />}
          />
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
          <DetailRow label="Venue" value={`${shift.venueName} · ${shift.venueAddress}`} />
          <DetailRow label="Duration" value={getShiftTimeRange(shift)} />
          <DetailRow isLast label="Team" value={shift.coworkers?.join(", ") ?? "To be confirmed"} />
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
          <ActionRow
            onPress={() =>
              router.push(`/(app)/request?category=shift_change&shiftId=${shift.id}` as never)
            }
            subtitle="Start a shift change request from this shift"
            title="Need replacement help"
            leading={<Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />}
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />

          <ActionRow
            onPress={() => router.push("/(app)/request?category=time_off" as never)}
            subtitle="Use this if the whole day no longer works for you"
            title="Request time off"
            leading={<Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />}
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />
        </View>
      </GroupedSection>

      {shift.dayLabel === "Today" ? (
        <AppButton label="Open Time" onPress={() => router.push("/(app)/(tabs)/time" as never)} />
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
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
})
