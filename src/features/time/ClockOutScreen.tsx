/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useClockSummary, useTimeDataQuery } from "@/features/time/data/time.queries"
import { AppButton, AppScrollScreen, GroupedSection, Text, useDesignTokens } from "@/ui"

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
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: `${tokens.success}1A` }]}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={42} />
          </View>
          <View style={styles.centerStack}>
            <Text
              text="Great shift!"
              weight="bold"
              style={{
                color: tokens.textPrimary,
                fontSize: 22,
                lineHeight: 28,
                textAlign: "center",
              }}
            />
            <Text
              text="You've clocked out successfully"
              size="xs"
              style={{ color: tokens.textSecondary, textAlign: "center" }}
            />
          </View>
          <View style={styles.successStats}>
            <View style={styles.statBlock}>
              <Text
                text={workedLabel}
                weight="bold"
                style={{ color: tokens.textPrimary, fontSize: 22, lineHeight: 27 }}
              />
              <Text
                text="Worked"
                size="xxs"
                style={{ color: tokens.textSecondary, textAlign: "center" }}
              />
            </View>
            <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />
            <View style={styles.statBlock}>
              <Text
                text={`€${earnings}`}
                weight="bold"
                style={{ color: tokens.success, fontSize: 22, lineHeight: 27 }}
              />
              <Text
                text="Estimated"
                size="xxs"
                style={{ color: tokens.textSecondary, textAlign: "center" }}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.summaryIntro}>
            <Text
              text={workedLabel}
              weight="bold"
              style={{ color: tokens.textPrimary, fontSize: 40, lineHeight: 44 }}
            />
          </View>

          <GroupedSection title="Shift summary">
            <SummaryItem label="Clocked in" value={summary.startedAtLabel ?? "--:--"} />
            <SummaryItem label="Clocked out" value={clockOutTime} />
            <SummaryItem label="Break time" tone="warning" value={breakLabel} />
            {overtime > 0 ? (
              <SummaryItem
                isLast
                label="Overtime"
                tone="warning"
                value={formatDurationLabel(overtime)}
              />
            ) : (
              <SummaryItem isLast label="Hourly rate" value={rateLabel} />
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

function SummaryItem({
  isLast,
  label,
  tone,
  value,
}: {
  isLast?: boolean
  label: string
  tone?: "warning"
  value: string
}) {
  const tokens = useDesignTokens()
  const valueColor = tone === "warning" ? tokens.warning : tokens.textPrimary

  return (
    <View
      style={[
        styles.summaryItem,
        !isLast
          ? {
              borderBottomColor: tokens.separator,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }
          : null,
      ]}
    >
      <View style={styles.summaryItemCopy}>
        <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      </View>
      <Text text={value} size="xs" weight="semiBold" style={{ color: valueColor }} />
    </View>
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
        style={{ color: tokens.success, fontSize: 24, lineHeight: 28 }}
      />
    </View>
  )
}

function rateLabelForDisplay(workedLabel: string) {
  return `€${HOURLY_RATE.toFixed(2)}/hr x ${workedLabel}`
}

const styles = StyleSheet.create({
  centerStack: {
    alignItems: "center",
    gap: 6,
  },
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
  successContent: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  successIcon: {
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
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
  summaryItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryItemCopy: {
    flex: 1,
    minWidth: 0,
  },
})
