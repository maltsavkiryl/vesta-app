import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, getShiftTimeRange } from "@/core/date"
import type { Shift } from "@/core/models"
import {
  ActionRow,
  AppButton,
  EmptyState,
  GroupedSection,
  MetaPill,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

export function ShiftDetailEmptyState() {
  const router = useRouter()
  const tokens = useDesignTokens()

  return (
    <EmptyState
      actionLabel="Back to Planning"
      icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
      onAction={() => router.replace("/(app)/(tabs)/schedule")}
      subtitle="This shift is no longer in your planning. It may have been removed or changed."
      title="Shift no longer available"
    />
  )
}

export function ShiftDetailHero({
  onOpenMaps,
  shift,
}: {
  onOpenMaps: () => void
  shift: Shift
}) {
  const tokens = useDesignTokens()

  return (
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
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={shift.role}
          weight="medium"
        />
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={[styles.heroTime, { color: tokens.textPrimary }]}
        text={getShiftTimeRange(shift)}
        weight="bold"
      />
      <Text size="xs" style={{ color: tokens.textSecondary }} text={formatFullDate(shift.date)} />
      <View style={styles.infoRow}>
        <MetaPill
          label={shift.venueName}
          leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={13} />}
        />
        <Pressable
          onPress={onOpenMaps}
          style={[styles.mapActionChip, { backgroundColor: tokens.backgroundMuted }]}
        >
          <Ionicons color={tokens.textSecondary} name="location-outline" size={13} />
          <Text
            size="xxs"
            style={{ color: tokens.textSecondary }}
            text="Open in Maps"
            weight="medium"
          />
        </Pressable>
      </View>
    </SurfaceCard>
  )
}

export function ShiftChangeSummaryCallout({ summary }: { summary: string }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}25` },
      ]}
    >
      <Ionicons color={tokens.warning} name="sparkles-outline" size={16} />
      <View style={styles.flex}>
        <Text size="xxs" style={{ color: tokens.warning }} text="What changed" weight="semiBold" />
        <Text size="xxs" style={{ color: tokens.textPrimary }} text={summary} />
      </View>
    </View>
  )
}

export function ShiftActionNeededSection({
  callout,
  onAcknowledge,
}: {
  callout?: ReactNode
  onAcknowledge: () => void | Promise<void>
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection headerContent={callout} title="Action needed">
      <View style={styles.groupBody}>
        <Text
          size="xs"
          style={{ color: tokens.textSecondary }}
          text="Your manager is waiting for a response on this update before the rota is locked."
        />
        <AppButton
          fullWidth
          label="Acknowledge update"
          onPress={() => {
            void onAcknowledge()
          }}
          pressHaptic="none"
        />
      </View>
    </GroupedSection>
  )
}

export function ShiftPlanSection({ shift }: { shift: Shift }) {
  return (
    <GroupedSection title="Plan for this shift">
      <ShiftPlanRow label="Venue" value={shift.venueName} />
      <ShiftPlanRow label="Address" value={shift.venueAddress} />
      <ShiftPlanRow label="Time" value={getShiftTimeRange(shift)} />
      <ShiftPlanRow
        isLast
        label="Team"
        value={shift.coworkers?.join(", ") ?? "To be confirmed"}
      />
    </GroupedSection>
  )
}

export function ShiftManagerNoteSection({ note }: { note: string }) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection title="Manager note">
      <View style={styles.groupBody}>
        <Text size="xs" style={{ color: tokens.textPrimary }} text={note} />
      </View>
    </GroupedSection>
  )
}

export function ShiftRequestActions({ shift }: { shift: Shift }) {
  const router = useRouter()
  const tokens = useDesignTokens()

  return (
    <GroupedSection
      bodyStyle={[styles.actionSectionBody, { backgroundColor: tokens.transparent }]}
      title="Need to change this shift?"
    >
      <View style={styles.actionStack}>
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />}
          onPress={() => router.push(`/(app)/request?category=shift_change&shiftId=${shift.id}` as never)}
          subtitle="Start a shift change request from this shift"
          title="Request a replacement"
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />

        <ActionRow
          leading={<Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />}
          onPress={() => router.push("/(app)/request?category=time_off" as never)}
          subtitle="Use this if the whole day no longer works for you"
          title="Request time off"
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </GroupedSection>
  )
}

export function ShiftOpenTimeAction() {
  const router = useRouter()

  return <AppButton label="Open Time" onPress={() => router.push("/(app)/(tabs)/time" as never)} />
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
      {!isLast ? <View style={[styles.planDivider, { backgroundColor: tokens.separator }]} /> : null}
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
  mapActionChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
})
