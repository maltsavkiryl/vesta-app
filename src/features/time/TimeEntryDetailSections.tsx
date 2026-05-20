import { Image, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"

import { formatDurationLabel, formatFullDate, formatTimeValue } from "@/core/date"
import type { TimeEntry, TimeEntryEvent } from "@/core/models"
import {
  getBreakSegments,
  getTimeEntryBreakLabel,
  getTimeEntryEarningsLabel,
  getTimeEntryEventLabel,
  getTimeEntryGrossLabel,
  getTimeEntryTimeRangeLabel,
  getTimeEntryWorkedLabel,
} from "@/core/timeEntries"
import { TimeHeroCard, timeHeroColors } from "@/features/time/components/TimeHeroCard"
import {
  DetailRow,
  GroupedSection,
  StatusBadge,
  SurfaceCard,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

export function TimeEntryDetailEmptyState() {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard style={styles.emptyCard}>
      <Text style={{ color: tokens.textPrimary }} text="Entry not found" weight="semiBold" />
      <Text
        size="xs"
        style={{ color: tokens.textSecondary }}
        text="This time entry is no longer available in local state."
      />
    </SurfaceCard>
  )
}

export function TimeEntryHero({
  entry,
  primaryLocationLabel,
}: {
  entry: TimeEntry
  primaryLocationLabel?: string
}) {
  return (
    <TimeHeroCard contentStyle={styles.heroContent} variant="compact">
      <View style={styles.heroTopRow}>
        <StatusBadge
          label={entry.status === "approved" ? "Approved" : "Needs review"}
          tone={entry.status === "approved" ? "success" : "warning"}
        />
        <Text
          size="xs"
          style={{ color: timeHeroColors.secondaryText }}
          text={formatFullDate(entry.date)}
        />
      </View>
      <Text
        style={[appTypography.pageTitle, { color: timeHeroColors.primaryText }]}
        text={getTimeEntryTimeRangeLabel(entry)}
        weight="bold"
      />
      <Text
        size="xs"
        style={{ color: timeHeroColors.secondaryText }}
        text={`${entry.shiftLabel} · ${entry.venueName}`}
      />
      <View style={styles.heroMetaRow}>
        <Ionicons color={timeHeroColors.tertiaryText} name="location-outline" size={16} />
        <Text
          size="xxs"
          style={[styles.flex, styles.heroMetaText, { color: timeHeroColors.secondaryText }]}
          text={primaryLocationLabel ?? entry.venueAddress}
        />
      </View>
    </TimeHeroCard>
  )
}

export function TimeEntrySummarySection({ entry }: { entry: TimeEntry }) {
  return (
    <GroupedSection title="Summary">
      <DetailRow label="Worked" value={getTimeEntryWorkedLabel(entry)} />
      <DetailRow label="Breaks" value={getTimeEntryBreakLabel(entry)} />
      <DetailRow label="Gross span" value={getTimeEntryGrossLabel(entry)} />
      <DetailRow isLast label="Estimated pay" value={getTimeEntryEarningsLabel(entry)} />
    </GroupedSection>
  )
}

export function TimeEntryMapSection({
  events,
  mapRegion,
}: {
  events: TimeEntryEvent[]
  mapRegion: NonNullable<ReturnType<typeof import("@/core/timeEntries").getTimeEntryMapRegion>>
}) {
  return (
    <GroupedSection title="Check-in map">
      <View style={styles.mapWrapper}>
        <MapView
          initialRegion={mapRegion}
          mapType="standard"
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          style={styles.map}
          toolbarEnabled={false}
          zoomEnabled={false}
        >
          {events
            .filter((event) => event.location)
            .map((event) => (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.location!.latitude,
                  longitude: event.location!.longitude,
                }}
                description={event.location?.addressLabel}
                title={getTimeEntryEventLabel(event.type)}
              />
            ))}
        </MapView>
      </View>
    </GroupedSection>
  )
}

export function TimeEntryPhotoSection({
  capturedAt,
  uri,
}: {
  capturedAt: string
  uri: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoSectionHeader}>
        <Text
          size="xxs"
          style={[styles.photoSectionTitle, { color: tokens.textMuted }]}
          text="Clock-in proof photo"
          weight="semiBold"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textPrimary }}
          text={formatTimeValue(capturedAt)}
          weight="semiBold"
        />
      </View>
      <View style={styles.photoWrapper}>
        <Image source={{ uri }} style={styles.photo} />
      </View>
    </View>
  )
}

export function TimeEntryBreaksSection({
  breakSegments,
}: {
  breakSegments: ReturnType<typeof getBreakSegments>
}) {
  const tokens = useDesignTokens()

  return (
    <GroupedSection title="Break sessions">
      {breakSegments.map((segment, index) => (
        <View
          key={segment.id}
          style={[
            styles.breakRow,
            !index && styles.firstBreakRow,
            index !== breakSegments.length - 1 && {
              borderBottomColor: tokens.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <View style={styles.flex}>
            <Text
              size="xs"
              style={{ color: tokens.textPrimary }}
              text={`Break ${index + 1}`}
              weight="semiBold"
            />
            <Text
              size="xxs"
              style={{ color: tokens.textSecondary }}
              text={`${formatTimeValue(segment.startEvent.occurredAt)} - ${
                segment.endEvent ? formatTimeValue(segment.endEvent.occurredAt) : "--:--"
              }`}
            />
          </View>
          <Text
            size="xs"
            style={{ color: tokens.textPrimary }}
            text={segment.durationSeconds > 0 ? formatDurationLabel(segment.durationSeconds) : "Open"}
            weight="medium"
          />
        </View>
      ))}
    </GroupedSection>
  )
}

export function TimeEntryTimelineSection({ events }: { events: TimeEntryEvent[] }) {
  return (
    <GroupedSection title="Timeline">
      {events.map((event, index) => (
        <TimelineRow key={event.id} event={event} isLast={index === events.length - 1} />
      ))}
    </GroupedSection>
  )
}

function TimelineRow({ event, isLast }: { event: TimeEntryEvent; isLast: boolean }) {
  const tokens = useDesignTokens()
  const iconName =
    event.type === "clockIn"
      ? "play-circle-outline"
      : event.type === "clockOut"
        ? "stop-circle-outline"
        : event.type === "breakStart"
          ? "cafe-outline"
          : "walk-outline"
  const iconColor =
    event.type === "clockIn"
      ? tokens.success
      : event.type === "clockOut"
        ? tokens.danger
        : event.type === "breakStart"
          ? tokens.warning
          : tokens.accent
  const iconBackgroundColor =
    event.type === "clockIn"
      ? tokens.successSoft
      : event.type === "clockOut"
        ? tokens.dangerSoft
        : event.type === "breakStart"
          ? tokens.warningSoft
          : tokens.accentSoft

  return (
    <View
      style={[
        styles.timelineRow,
        !isLast && {
          borderBottomColor: tokens.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.timelineIcon, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons color={iconColor} name={iconName} size={16} />
      </View>
      <View style={styles.flex}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text={getTimeEntryEventLabel(event.type)}
          weight="semiBold"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={event.location?.addressLabel ?? "No location snapshot"}
        />
      </View>
      <Text
        size="xs"
        style={{ color: tokens.textPrimary }}
        text={formatTimeValue(event.occurredAt)}
        weight="medium"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  breakRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyCard: {
    gap: 6,
    padding: 18,
  },
  firstBreakRow: {
    marginTop: -2,
  },
  flex: {
    flex: 1,
  },
  heroContent: {
    gap: 12,
  },
  heroMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  heroMetaText: {
    lineHeight: 20,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  map: {
    flex: 1,
  },
  mapWrapper: {
    height: 220,
    overflow: "hidden",
  },
  photo: {
    height: 280,
    width: "100%",
  },
  photoSection: {
    gap: 8,
  },
  photoSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 22,
    paddingHorizontal: 4,
  },
  photoSectionTitle: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  photoWrapper: {
    borderCurve: "continuous",
    borderRadius: 24,
    overflow: "hidden",
  },
  timelineIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  timelineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
})
