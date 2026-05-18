/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { Pressable, StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatShortDate, getShiftTimeRange } from "@/core/date"
import type { Shift, ShiftStatus } from "@/core/models"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { AppScrollScreen, Text, useDesignTokens } from "@/ui"
import type { DesignTokens } from "@/ui"

const colleagues = ["Emma D.", "Lucas M.", "Yasmine K."]

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getDuration(shift: Shift) {
  let minutes = timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)
  if (minutes < 0) minutes += 24 * 60
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function getEstimatedPay(shift: Shift) {
  let minutes = timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)
  if (minutes < 0) minutes += 24 * 60
  return `€${((minutes / 60) * 12.02).toFixed(2)}`
}

function getStatusConfig(tokens: DesignTokens, status: ShiftStatus) {
  return {
    changed: { color: tokens.warning, label: "Changed" },
    confirmed: { color: tokens.success, label: "Confirmed" },
    pending: { color: tokens.textMuted, label: "Pending" },
  }[status]
}

function Header({ shift }: { shift: Shift }) {
  const tokens = useDesignTokens()
  const status = getStatusConfig(tokens, shift.status)

  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text text={status.label} size="xxs" weight="semiBold" style={{ color: status.color }} />
          {shift.status === "changed" ? (
            <View style={[styles.updatedPill, { backgroundColor: `${tokens.warning}14` }]}>
              <Text
                text="Updated"
                size="xxs"
                weight="medium"
                style={{ color: tokens.warning, fontSize: 11 }}
              />
            </View>
          ) : null}
        </View>
        <Text
          text={getShiftTimeRange(shift)}
          weight="bold"
          style={[styles.timeTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text={`${shift.dayLabel} · ${formatShortDate(shift.date)}`}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
    </View>
  )
}

function DetailRows({ shift }: { shift: Shift }) {
  const tokens = useDesignTokens()
  const rows = [
    { label: "Role", value: shift.role },
    { label: "Duration", value: getDuration(shift) },
    { label: "Est. pay", value: getEstimatedPay(shift) },
  ]

  return (
    <View style={[styles.detailRows, { backgroundColor: tokens.surface }]}>
      {rows.map((row) => (
        <View key={row.label} style={[styles.detailRow, { borderBottomColor: tokens.border }]}>
          <Text text={row.label} size="xs" style={{ color: tokens.textSecondary }} />
          <Text text={row.value} size="xs" weight="medium" style={{ color: tokens.textPrimary }} />
        </View>
      ))}
    </View>
  )
}

function LocationCard({ shift }: { shift: Shift }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.locationCard, { backgroundColor: tokens.surface }]}>
      <Ionicons color={tokens.textMuted} name="location-outline" size={17} />
      <View style={styles.flex}>
        <Text
          text={shift.venueName}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={shift.venueAddress} size="xxs" style={{ color: tokens.textSecondary }} />
      </View>
      <Ionicons color={tokens.success} name="checkmark-circle-outline" size={15} />
    </View>
  )
}

function Timeline({ shift }: { shift: Shift }) {
  const tokens = useDesignTokens()
  const duration = getDuration(shift)

  return (
    <View style={[styles.timeline, { backgroundColor: tokens.surface }]}>
      <Text
        text="TIMELINE"
        size="xxs"
        weight="semiBold"
        style={[styles.caps, { color: tokens.textMuted }]}
      />
      <View style={styles.timelineBody}>
        <View style={styles.timelineRail}>
          <View style={[styles.timelineDot, { backgroundColor: tokens.success }]} />
          <View style={[styles.timelineLine, { backgroundColor: tokens.border }]} />
          <View style={[styles.timelineDot, { backgroundColor: tokens.danger }]} />
        </View>
        <View style={styles.flex}>
          <View style={styles.timelinePoint}>
            <Text
              text={shift.startTime}
              weight="bold"
              style={[styles.timelineTime, { color: tokens.textPrimary }]}
            />
            <Text
              text={`Clock in · ${shift.venueName}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <View>
            <Text
              text={shift.endTime}
              weight="bold"
              style={[styles.timelineTime, { color: tokens.textPrimary }]}
            />
            <Text
              text={`Clock out · ${duration} total`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
        </View>
        <View style={[styles.readyPill, { backgroundColor: `${tokens.success}14` }]}>
          <Ionicons color={tokens.success} name="checkmark-circle-outline" size={12} />
          <Text
            text="Ready"
            size="xxs"
            weight="semiBold"
            style={{ color: tokens.success, fontSize: 11 }}
          />
        </View>
      </View>
    </View>
  )
}

function ColleaguesCard() {
  const tokens = useDesignTokens()
  const colors = [tokens.accent, tokens.success, tokens.warning]

  return (
    <View style={[styles.colleaguesCard, { backgroundColor: tokens.surface }]}>
      <View style={styles.colleaguesHeader}>
        <Ionicons color={tokens.textMuted} name="people-outline" size={14} />
        <Text
          text="ON SHIFT WITH YOU"
          size="xxs"
          weight="semiBold"
          style={[styles.caps, { color: tokens.textMuted }]}
        />
      </View>
      <View style={styles.colleagueList}>
        {colleagues.map((name, index) => (
          <View
            key={name}
            style={[
              styles.colleaguePill,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={[styles.colleagueAvatar, { backgroundColor: `${colors[index]}18` }]}>
              <Text text={name[0]} size="xxs" weight="bold" style={{ color: colors[index] }} />
            </View>
            <Text text={name} size="xxs" style={{ color: tokens.textPrimary }} />
          </View>
        ))}
      </View>
    </View>
  )
}

function ActionCard({
  icon,
  subtitle,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  subtitle: string
  title: string
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
    >
      <Ionicons color={tokens.textPrimary} name={icon} size={19} />
      <View>
        <Text text={title} size="xxs" weight="semiBold" style={{ color: tokens.textPrimary }} />
        <Text text={subtitle} size="xxs" style={{ color: tokens.textSecondary, fontSize: 11 }} />
      </View>
    </Pressable>
  )
}

export function ShiftDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const { state } = useScheduleStateQuery()
  const shift = state?.shifts.find((item) => item.id === id)

  if (!shift) {
    return (
      <AppScrollScreen
        contentContainerStyle={styles.screen}
        style={{ backgroundColor: tokens.groupedBackground }}
      >
        <Header
          shift={{
            date: "",
            dayLabel: "",
            endTime: "",
            id: "",
            role: "",
            startTime: "",
            status: "pending",
            venueAddress: "",
            venueName: "Shift not found",
          }}
        />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <Header shift={shift} />
      <View style={styles.content}>
        <DetailRows shift={shift} />
        <LocationCard shift={shift} />
        <Timeline shift={shift} />
        <ColleaguesCard />

        {shift.dayLabel === "Today" ? (
          <View
            style={[
              styles.clockNotice,
              { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}22` },
            ]}
          >
            <Ionicons color={tokens.warning} name="flash-outline" size={14} />
            <Text
              text="Clock-in opens at 16:45 · 3h away"
              size="xxs"
              weight="medium"
              style={[styles.flex, { color: tokens.warning }]}
            />
          </View>
        ) : null}

        <View style={styles.actionGrid}>
          <ActionCard
            icon="swap-horizontal-outline"
            title="Swap shift"
            subtitle="Find a replacement"
            onPress={() => router.push("/(app)/request" as never)}
          />
          <ActionCard
            icon="calendar-clear-outline"
            title="Request off"
            subtitle="Time off request"
            onPress={() => router.push("/(app)/request" as never)}
          />
        </View>

        <Pressable
          style={[
            styles.directionsButton,
            { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          <View style={styles.directionsCopy}>
            <Ionicons color={tokens.accent} name="navigate-outline" size={18} />
            <View>
              <Text
                text="Get directions"
                size="xs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
              <Text text="Open in Maps" size="xxs" style={{ color: tokens.textSecondary }} />
            </View>
          </View>
          <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
        </Pressable>

        {shift.dayLabel === "Today" ? (
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/time" as never)}
            style={[styles.clockInButton, { backgroundColor: tokens.accent }]}
          >
            <Ionicons color={tokens.accentForeground} name="time-outline" size={17} />
            <Text
              text="Clock in now"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  actionCard: {
    alignItems: "flex-start",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  caps: {
    letterSpacing: 0,
  },
  clockInButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    padding: 15,
  },
  clockNotice: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  colleagueAvatar: {
    alignItems: "center",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  colleagueList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  colleaguePill: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 10,
    paddingTop: 4,
  },
  colleaguesCard: {
    borderCurve: "continuous",
    borderRadius: 14,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  colleaguesHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  content: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  detailRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  detailRows: {
    borderCurve: "continuous",
    borderRadius: 16,
    overflow: "hidden",
  },
  directionsButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  directionsCopy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  locationCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  readyPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  screen: {
    paddingBottom: 36,
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 6,
  },
  timeTitle: {
    fontSize: 26,
    lineHeight: 31,
  },
  timeline: {
    borderCurve: "continuous",
    borderRadius: 16,
    padding: 16,
  },
  timelineBody: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  timelineLine: {
    flex: 1,
    marginVertical: 4,
    width: 1.5,
  },
  timelinePoint: {
    marginBottom: 22,
  },
  timelineRail: {
    alignItems: "center",
    paddingTop: 3,
  },
  timelineTime: {
    fontSize: 17,
    lineHeight: 22,
  },
  updatedPill: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
})
