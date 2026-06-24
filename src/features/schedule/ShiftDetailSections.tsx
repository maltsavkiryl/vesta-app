import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatFullDate, getShiftTimeRange } from "@/core/date"
import type { Shift } from "@/core/models"
import { translate } from "@/i18n/translate"
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

// ─── Empty ────────────────────────────────────────────────────────────────────

export function ShiftDetailEmptyState() {
  const router = useRouter()
  const tokens = useDesignTokens()

  return (
    <EmptyState
      actionLabel="Back to Planning"
      icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
      onAction={() => router.replace("/(app)/(tabs)/schedule")}
      subtitle={translate("planning:shiftDetail.notFoundSubtitle")}
      title={translate("planning:shiftDetail.notFoundTitle")}
    />
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function ShiftDetailHero({ onOpenMaps, shift }: { onOpenMaps: () => void; shift: Shift }) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard elevationLevel={1} style={styles.heroCard}>
      {/* Status + role */}
      <View style={styles.heroHeader}>
        <StatusBadge
          label={
            shift.responseStatus === "declined"
              ? "Declined"
              : shift.requiresResponse
                ? "Needs response"
                : shift.status
          }
          tone={
            shift.responseStatus === "declined"
              ? "danger"
              : shift.requiresResponse
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

      {/* Time — prominent */}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={[styles.heroTime, { color: tokens.textPrimary }]}
        text={getShiftTimeRange(shift)}
        weight="bold"
      />

      {/* Full date */}
      <Text size="xs" style={{ color: tokens.textSecondary }} text={formatFullDate(shift.date)} />

      {/* Venue + maps */}
      <View style={styles.infoRow}>
        <MetaPill
          label={shift.venueName}
          leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={13} />}
        />
        <Pressable
          accessibilityLabel={translate("planning:schedule.openInMapsA11y")}
          accessibilityRole="button"
          onPress={onOpenMaps}
          style={({ pressed }) => [
            styles.mapActionChip,
            {
              backgroundColor: pressed ? tokens.backgroundMuted : tokens.accentMuted,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Ionicons color={tokens.accent} name="location-outline" size={13} />
          <Text
            size="xxs"
            style={{ color: tokens.accent }}
            text={translate("planning:schedule.openInMaps")}
            weight="medium"
          />
        </Pressable>
      </View>
    </SurfaceCard>
  )
}

// ─── Change summary callout ───────────────────────────────────────────────────

export function ShiftChangeSummaryCallout({ summary }: { summary: string }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: tokens.warningSoft, borderColor: `${tokens.warning}25` },
      ]}
    >
      <Ionicons color={tokens.warning} name="sparkles-outline" size={16} />
      <View style={styles.flex}>
        <Text
          size="xxs"
          style={{ color: tokens.warning }}
          text={translate("planning:shiftDetail.whatChanged")}
          weight="semiBold"
        />
        <Text size="xxs" style={{ color: tokens.textPrimary }} text={summary} />
      </View>
    </View>
  )
}

// ─── Action needed ────────────────────────────────────────────────────────────

export function ShiftActionNeededSection({
  callout,
  onAcknowledge,
  onDecline,
}: {
  callout?: ReactNode
  onAcknowledge: () => void | Promise<void>
  onDecline: () => void | Promise<void>
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection headerContent={callout} title={translate("planning:shiftDetail.actionNeeded")}>
      <View style={styles.groupBody}>
        <Text
          size="xs"
          style={{ color: tokens.textSecondary }}
          text={translate("planning:shiftDetail.actionNeededBody")}
        />
        <View style={styles.responseActions}>
          <AppButton
            accessibilityLabel={translate("planning:shiftDetail.acceptA11y")}
            fullWidth
            label={translate("planning:shiftDetail.accept")}
            onPress={() => {
              void onAcknowledge()
            }}
            pressHaptic="none"
          />
          <AppButton
            accessibilityLabel={translate("planning:shiftDetail.declineA11y")}
            fullWidth
            label={translate("planning:shiftDetail.decline")}
            onPress={() => {
              void onDecline()
            }}
            pressHaptic="none"
            variant="secondary"
          />
        </View>
      </View>
    </GroupedSection>
  )
}

// ─── Declined state ───────────────────────────────────────────────────────────

export function ShiftDeclinedSection() {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: tokens.dangerSoft, borderColor: `${tokens.danger}25` },
      ]}
    >
      <Ionicons color={tokens.danger} name="close-circle-outline" size={16} />
      <View style={styles.flex}>
        <Text
          size="xxs"
          style={{ color: tokens.danger }}
          text={translate("planning:shiftDetail.declinedTitle")}
          weight="semiBold"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textPrimary }}
          text={translate("planning:shiftDetail.declinedBody")}
        />
      </View>
    </View>
  )
}

// ─── Plan section ─────────────────────────────────────────────────────────────

export function ShiftPlanSection({ shift }: { shift: Shift }) {
  return (
    <GroupedSection title={translate("planning:shiftDetail.planTitle")}>
      <ShiftPlanRow label={translate("planning:shiftDetail.venue")} value={shift.venueName} />
      <ShiftPlanRow label={translate("planning:shiftDetail.address")} value={shift.venueAddress} />
      <ShiftPlanRow
        label={translate("planning:shiftDetail.time")}
        value={getShiftTimeRange(shift)}
      />
      <ShiftPlanRow
        isLast
        label={translate("planning:shiftDetail.team")}
        value={shift.coworkers?.join(", ") ?? "To be confirmed"}
      />
    </GroupedSection>
  )
}

// ─── Manager note ─────────────────────────────────────────────────────────────

export function ShiftManagerNoteSection({ note }: { note: string }) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection title={translate("planning:shiftDetail.managerNote")}>
      <View style={[styles.groupBody, styles.noteBody]}>
        <Ionicons color={tokens.textMuted} name="chatbubble-ellipses-outline" size={14} />
        <Text size="xs" style={[styles.flex, { color: tokens.textPrimary }]} text={note} />
      </View>
    </GroupedSection>
  )
}

// ─── Request actions ──────────────────────────────────────────────────────────

export function ShiftRequestActions({ shift }: { shift: Shift }) {
  const router = useRouter()
  const tokens = useDesignTokens()

  return (
    <GroupedSection
      bodyStyle={[styles.actionSectionBody, { backgroundColor: tokens.transparent }]}
      title={translate("planning:shiftDetail.changeTitle")}
    >
      <View style={styles.actionStack}>
        <ActionRow
          leading={<Ionicons color={tokens.accent} name="swap-horizontal-outline" size={18} />}
          onPress={() =>
            router.push(`/(app)/request?category=shift_change&shiftId=${shift.id}` as never)
          }
          subtitle={translate("planning:shiftDetail.replacementSubtitle")}
          title={translate("planning:shiftDetail.replacementTitle")}
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />

        <ActionRow
          leading={<Ionicons color={tokens.accent} name="calendar-clear-outline" size={18} />}
          onPress={() => router.push("/(app)/request?category=time_off" as never)}
          subtitle={translate("planning:shiftDetail.timeOffSubtitle")}
          title={translate("planning:shiftDetail.timeOffTitle")}
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </GroupedSection>
  )
}

// ─── Open time ────────────────────────────────────────────────────────────────

export function ShiftOpenTimeAction() {
  const router = useRouter()

  return (
    <AppButton
      label={translate("planning:shiftDetail.openTime")}
      onPress={() => router.push("/(app)/(tabs)/time" as never)}
    />
  )
}

// ─── Plan row ─────────────────────────────────────────────────────────────────

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
      <Text size="xs" style={[styles.planLabel, { color: tokens.textMuted }]} text={label} />
      <Text
        size="xs"
        style={[styles.planValue, { color: tokens.textPrimary }]}
        text={value}
        weight="medium"
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
  noteBody: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
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
    minHeight: 60,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: "relative",
  },
  planValue: {
    flex: 1,
    minWidth: 0,
  },
  responseActions: {
    gap: 10,
  },
})
