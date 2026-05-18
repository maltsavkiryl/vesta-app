/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { Image, StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"

import { formatDurationLabel, formatFullDate, formatShortDate, formatTimeValue } from "@/core/date"
import type { TimeEntryEvent } from "@/core/models"
import {
  getBreakSegments,
  getTimeEntryBreakLabel,
  getTimeEntryEarningsLabel,
  getTimeEntryEventLabel,
  getTimeEntryEventsSorted,
  getTimeEntryGrossLabel,
  getTimeEntryMapRegion,
  getTimeEntryPrimaryLocation,
  getTimeEntryTimeRangeLabel,
  getTimeEntryWorkedLabel,
} from "@/core/timeEntries"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import {
  AppScrollScreen,
  GroupedSection,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

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

  return (
    <View
      style={[
        styles.timelineRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: tokens.border,
        },
      ]}
    >
      <View style={[styles.timelineIcon, { backgroundColor: `${iconColor}14` }]}>
        <Ionicons color={iconColor} name={iconName} size={16} />
      </View>
      <View style={styles.flex}>
        <Text
          text={getTimeEntryEventLabel(event.type)}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={event.location?.addressLabel ?? "No location snapshot"}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Text
        text={formatTimeValue(event.occurredAt)}
        size="xs"
        weight="medium"
        style={{ color: tokens.textPrimary }}
      />
    </View>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.metricRow,
        { borderBottomColor: tokens.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      <Text text={value} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

function DetailRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.metricRow,
        !isLast
          ? { borderBottomColor: tokens.border, borderBottomWidth: StyleSheet.hairlineWidth }
          : null,
      ]}
    >
      <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      <Text text={value} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
    </View>
  )
}

export function TimeEntryDetailScreen() {
  const tokens = useDesignTokens()
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useTimeDataQuery()
  const entry = query.data?.timeEntries.find((candidate) => candidate.id === id)

  if (!entry) {
    return (
      <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
        <Stack.Screen options={{ title: "Entry details" }} />
        <SurfaceCard style={styles.emptyCard}>
          <Text text="Entry not found" weight="semiBold" style={{ color: tokens.textPrimary }} />
          <Text
            text="This time entry is no longer available in local state."
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
        </SurfaceCard>
      </AppScrollScreen>
    )
  }

  const sortedEvents = getTimeEntryEventsSorted(entry.events)
  const breakSegments = getBreakSegments(entry.events)
  const mapRegion = getTimeEntryMapRegion(entry)
  const primaryLocation = getTimeEntryPrimaryLocation(entry)

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: formatShortDate(entry.clockInAt) }} />

      <SurfaceCard elevated style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <StatusBadge
            label={entry.status === "approved" ? "Approved" : "Needs review"}
            tone={entry.status === "approved" ? "success" : "warning"}
          />
          <Text
            text={formatFullDate(entry.date)}
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Text
          text={getTimeEntryTimeRangeLabel(entry)}
          weight="bold"
          style={[styles.heroTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text={`${entry.shiftLabel} · ${entry.venueName}`}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
        <View style={styles.heroMetaRow}>
          <Ionicons color={tokens.textMuted} name="location-outline" size={16} />
          <Text
            text={primaryLocation?.addressLabel ?? entry.venueAddress}
            size="xxs"
            style={[styles.flex, { color: tokens.textSecondary, lineHeight: 20 }]}
          />
        </View>
      </SurfaceCard>

      <GroupedSection title="Summary">
        <DetailRow label="Worked" value={getTimeEntryWorkedLabel(entry)} />
        <DetailRow label="Breaks" value={getTimeEntryBreakLabel(entry)} />
        <DetailRow label="Gross span" value={getTimeEntryGrossLabel(entry)} />
        <DetailRow isLast label="Estimated pay" value={getTimeEntryEarningsLabel(entry)} />
      </GroupedSection>

      {mapRegion ? (
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
              {sortedEvents
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
      ) : null}

      {entry.clockInProofPhoto ? (
        <GroupedSection title="Clock-in proof photo">
          <View style={styles.photoWrapper}>
            <Image source={{ uri: entry.clockInProofPhoto.uri }} style={styles.photo} />
          </View>
          <Text
            text={`Captured at ${formatTimeValue(entry.clockInProofPhoto.capturedAt)}`}
            size="xxs"
            style={[styles.photoCaption, { color: tokens.textSecondary }]}
          />
        </GroupedSection>
      ) : null}

      {breakSegments.length > 0 ? (
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
                  text={`Break ${index + 1}`}
                  size="xs"
                  weight="semiBold"
                  style={{ color: tokens.textPrimary }}
                />
                <Text
                  text={`${formatTimeValue(segment.startEvent.occurredAt)} - ${
                    segment.endEvent ? formatTimeValue(segment.endEvent.occurredAt) : "--:--"
                  }`}
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                />
              </View>
              <Text
                text={
                  segment.durationSeconds > 0
                    ? formatDurationLabel(segment.durationSeconds)
                    : "Open"
                }
                size="xs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
            </View>
          ))}
        </GroupedSection>
      ) : null}

      <GroupedSection title="Timeline">
        {sortedEvents.map((event, index) => (
          <TimelineRow key={event.id} event={event} isLast={index === sortedEvents.length - 1} />
        ))}
      </GroupedSection>
    </AppScrollScreen>
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
  heroCard: {
    gap: 10,
    padding: 18,
  },
  heroMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 33,
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
  metricRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  photo: {
    height: 280,
    width: "100%",
  },
  photoCaption: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  photoWrapper: {
    overflow: "hidden",
  },
  screen: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
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
