import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useClockSummary, useTimeDataQuery } from "@/features/time/data/time.queries"
import {
  AppButton,
  AppScrollScreen,
  DetailRow,
  GroupedSection,
  SuccessState,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

import { captureLocationSnapshot } from "./timeCapture"

const HOURLY_RATE = 12.02

export function ClockOutScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { confirmClockOut } = useTimeActions()
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  const summary = useClockSummary()
  const [confirmed, setConfirmed] = useState(false)

  if (!clockSession) {
    return null
  }

  const netSeconds = Math.max(summary.payableSeconds, 0)
  const breakLabel = formatDurationLabel(summary.breakSeconds)
  const workedLabel = formatDurationLabel(netSeconds)
  const earnings = ((netSeconds / 3600) * HOURLY_RATE).toFixed(2)
  const rateLabel = `€${HOURLY_RATE.toFixed(2)}/hr`
  const overtime = netSeconds > 6 * 3600 ? netSeconds - 6 * 3600 : 0
  const clockOutTime = formatTimeLabel(new Date())

  const finish = async () => {
    const occurredAt = new Date().toISOString()
    const location = await captureLocationSnapshot(clockSession.venueAddress)
    const result = await confirmClockOut({ occurredAt, location })
    if (!result.ok) return
    setConfirmed(true)
    setTimeout(() => router.replace("/(app)/(tabs)/time"), 900)
  }

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.groupedBackground }}
      topInset="none"
    >
      {confirmed ? (
        <SuccessState title="Great shift!" subtitle="You've clocked out successfully">
          <View style={styles.successStats}>
            <View style={styles.statBlock}>
              <Text
                text={workedLabel}
                weight="bold"
                style={[appTypography.successTitle, { color: tokens.textPrimary }]}
              />
              <Text
                text="Worked"
                size="xxs"
                style={[styles.statLabel, { color: tokens.textSecondary }]}
              />
            </View>
            <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />
            <View style={styles.statBlock}>
              <Text
                text={`€${earnings}`}
                weight="bold"
                style={[appTypography.successTitle, { color: tokens.success }]}
              />
              <Text
                text="Estimated"
                size="xxs"
                style={[styles.statLabel, { color: tokens.textSecondary }]}
              />
            </View>
          </View>
        </SuccessState>
      ) : (
        <View style={styles.content}>
          <View style={styles.summaryIntro}>
            <Text
              text={workedLabel}
              weight="bold"
              style={[appTypography.heroValue, styles.heroValue, { color: tokens.textPrimary }]}
            />
          </View>

          <GroupedSection title="Shift summary">
            <DetailRow label="Clocked in" value={summary.startedAtLabel ?? "--:--"} />
            <DetailRow label="Clocked out" value={clockOutTime} />
            <DetailRow label="Break time" value={breakLabel} valueTone="warning" />
            {overtime > 0 ? (
              <DetailRow
                isLast
                label="Overtime"
                value={formatDurationLabel(overtime)}
                valueTone="warning"
              />
            ) : (
              <DetailRow isLast label="Hourly rate" value={rateLabel} />
            )}
          </GroupedSection>

          <GroupedSection title="Pay">
            <PaySummary workedLabel={workedLabel} earnings={earnings} />
          </GroupedSection>

          <View style={styles.footerBlock}>
            <View style={styles.footerActions}>
              <AppButton label="Confirm clock out" variant="danger" onPress={finish} />
              <AppButton label="Keep working" variant="secondary" onPress={router.back} />
            </View>
          </View>
        </View>
      )}
    </AppScrollScreen>
  )
}

function PaySummary({ earnings, workedLabel }: { earnings: string; workedLabel: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.payRow}>
      <View style={styles.payCopy}>
        <Text
          text="Estimated earnings"
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${rateLabelForDisplay(workedLabel)}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Text
        text={`€${earnings}`}
        weight="bold"
        style={[styles.payValue, { color: tokens.success }]}
      />
    </View>
  )
}

function rateLabelForDisplay(workedLabel: string) {
  return `€${HOURLY_RATE.toFixed(2)}/hr x ${workedLabel}`
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    padding: 20,
  },
  footerActions: {
    alignSelf: "stretch",
    gap: 10,
  },
  footerBlock: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 12,
    paddingTop: 4,
  },
  heroValue: {
    fontSize: 40,
  },
  payCopy: {
    flex: 1,
    gap: 2,
  },
  payRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  payValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  statBlock: {
    alignItems: "center",
    minWidth: 96,
  },
  statDivider: {
    width: 1,
  },
  statLabel: {
    textAlign: "center",
  },
  successStats: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },
  summaryIntro: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
})
