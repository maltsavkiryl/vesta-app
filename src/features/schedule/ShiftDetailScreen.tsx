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
  EmptyState,
  GroupedSection,
  MetaPill,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"
import { fireHaptic } from "@/utils/haptics"

export function ShiftDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const { state } = useScheduleStateQuery()
  const { respondToShift } = useScheduleActions()
  const shift = state?.shifts.find((item) => item.id === id)
  const changeSummaryCallout = shift?.changeSummary ? (
    <View
      style={[
        styles.callout,
        { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}25` },
      ]}
    >
      <Ionicons color={tokens.warning} name="sparkles-outline" size={16} />
      <View style={styles.flex}>
        <Text text="What changed" size="xxs" weight="semiBold" style={{ color: tokens.warning }} />
        <Text text={shift.changeSummary} size="xxs" style={{ color: tokens.textPrimary }} />
      </View>
    </View>
  ) : null

  if (!shift) {
    return (
      <AppScrollScreen
        contentContainerStyle={styles.screen}
        style={{ backgroundColor: tokens.groupedBackground }}
      >
        <EmptyState
          actionLabel="Back to Planning"
          icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
          onAction={() => router.replace("/(app)/(tabs)/schedule")}
          subtitle="This shift is no longer available in your local planning data."
          title="Shift not found"
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
      </SurfaceCard>

      {shift.requiresResponse ? (
        <GroupedSection headerContent={changeSummaryCallout} title="Action needed">
          <View style={styles.groupBody}>
            <Text
              text="Your manager is waiting for a response on this update before the rota is locked."
              size="xs"
              style={{ color: tokens.textSecondary }}
            />
            <AppButton
              fullWidth
              label="Acknowledge update"
              onPress={async () => {
                const result = await respondToShift(shift.id)
                if (!result.ok) {
                  fireHaptic("error")
                  return
                }

                fireHaptic("success")
              }}
              pressHaptic="none"
            />
          </View>
        </GroupedSection>
      ) : (
        changeSummaryCallout
      )}

      <GroupedSection title="Plan for this shift">
        <ShiftPlanRow label="Venue" value={`${shift.venueName} · ${shift.venueAddress}`} />
        <ShiftPlanRow label="Duration" value={getShiftTimeRange(shift)} />
        <ShiftPlanRow
          isLast
          label="Team"
          value={shift.coworkers?.join(", ") ?? "To be confirmed"}
        />
      </GroupedSection>

      {shift.note ? (
        <GroupedSection title="Manager note">
          <View style={styles.groupBody}>
            <Text text={shift.note} size="xs" style={{ color: tokens.textPrimary }} />
          </View>
        </GroupedSection>
      ) : null}

      <GroupedSection
        title="Need a change?"
        bodyStyle={[styles.actionSectionBody, { backgroundColor: tokens.transparent }]}
      >
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

function ShiftPlanRow({
  isLast = false,
  label,
  value,
}: {
  isLast?: boolean
  label: string
  value: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.planRow}>
      <Text size="xs" style={[styles.planLabel, { color: tokens.textSecondary }]} text={label} />
      <Text
        size="xs"
        style={[styles.planValue, { color: tokens.textPrimary }]}
        text={value}
        weight="semiBold"
      />
      {!isLast ? (
        <View style={[styles.planDivider, { backgroundColor: tokens.separator }]} />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  actionSectionBody: {
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
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
  planDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 18,
    position: "absolute",
    right: 18,
  },
  planLabel: {
    width: 84,
  },
  planRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: "relative",
  },
  planValue: {
    flex: 1,
    minWidth: 0,
  },
  screen: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
})
