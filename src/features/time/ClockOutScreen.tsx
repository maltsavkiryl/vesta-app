/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { formatDurationLabel, formatTimeLabel } from "@/core/date"
import { AppButton, AppScrollScreen } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession, useClockSummary } from "@/providers/app-provider"

const HOURLY_RATE = 12.02

export function ClockOutScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { state, confirmClockOut } = useAppSession()
  const summary = useClockSummary()
  const [confirmed, setConfirmed] = useState(false)

  const netSeconds = Math.max(summary.payableSeconds, 0)
  const breakLabel = formatDurationLabel(summary.breakSeconds)
  const workedLabel = formatDurationLabel(netSeconds)
  const earnings = ((netSeconds / 3600) * HOURLY_RATE).toFixed(2)
  const overtime = netSeconds > 6 * 3600 ? netSeconds - 6 * 3600 : 0
  const clockOutTime = formatTimeLabel(new Date())

  const finish = () => {
    confirmClockOut()
    setConfirmed(true)
    setTimeout(() => router.replace("/(app)/(tabs)/time"), 900)
  }

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.surfaceSecondary }}
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
        <>
          <View style={styles.header}>
            <View>
              <Text
                text="End shift"
                weight="bold"
                style={{ color: tokens.textPrimary, fontSize: 22, lineHeight: 27 }}
              />
              <Text
                text={`${state.clockSession.role} · ${state.clockSession.venueName}`}
                size="xxs"
                style={{ color: tokens.textSecondary, marginTop: 2 }}
              />
            </View>
            <Pressable
              accessibilityLabel="Close clock out"
              onPress={router.back}
              style={[styles.closeButton, { backgroundColor: tokens.background }]}
            >
              <Ionicons color={tokens.textSecondary} name="close-outline" size={16} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={[styles.summaryCard, { backgroundColor: tokens.background }]}>
              <SummaryRow
                icon="time-outline"
                label="Clocked in"
                value={summary.startedAtLabel ?? "--:--"}
              />
              <SummaryRow icon="time-outline" label="Clocked out" value={clockOutTime} />
              <SummaryRow icon="time-outline" label="Time worked" value={workedLabel} />
              <SummaryRow
                icon="cafe-outline"
                label="Break time"
                tone="warning"
                value={breakLabel}
                withDivider={false}
              />
            </View>

            <View
              style={[
                styles.earningsCard,
                {
                  backgroundColor: `${tokens.success}0D`,
                  borderColor: `${tokens.success}26`,
                },
              ]}
            >
              <View style={styles.earningsCopy}>
                <Ionicons color={tokens.success} name="cash-outline" size={17} />
                <View>
                  <Text
                    text="Estimated earnings"
                    size="xs"
                    weight="medium"
                    style={{ color: tokens.textPrimary }}
                  />
                  <Text
                    text={`€${HOURLY_RATE}/hr x ${workedLabel}`}
                    size="xxs"
                    style={{ color: tokens.textSecondary }}
                  />
                </View>
              </View>
              <Text
                text={`€${earnings}`}
                weight="bold"
                style={{ color: tokens.success, fontSize: 22, lineHeight: 27 }}
              />
            </View>

            {overtime > 0 ? (
              <View
                style={[
                  styles.overtimeCard,
                  {
                    backgroundColor: `${tokens.warning}10`,
                    borderColor: `${tokens.warning}26`,
                  },
                ]}
              >
                <Ionicons color={tokens.warning} name="star-outline" size={14} />
                <Text
                  text={`${formatDurationLabel(overtime)} overtime`}
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.warning }}
                />
              </View>
            ) : null}

            <Pressable
              onPress={finish}
              style={[styles.dangerButton, { backgroundColor: tokens.danger }]}
            >
              <Text
                text="Confirm clock out"
                size="sm"
                weight="semiBold"
                style={{ color: "#FFFFFF" }}
              />
            </Pressable>
            <AppButton label="Keep working" variant="secondary" onPress={router.back} />
          </View>
        </>
      )}
    </AppScrollScreen>
  )
}

function SummaryRow({
  icon,
  label,
  tone,
  value,
  withDivider = true,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  tone?: "warning"
  value: string
  withDivider?: boolean
}) {
  const tokens = useDesignTokens()
  const valueColor = tone === "warning" ? tokens.warning : tokens.textPrimary

  return (
    <View
      style={[
        styles.summaryRow,
        withDivider ? { borderBottomColor: tokens.border, borderBottomWidth: 1 } : null,
      ]}
    >
      <View style={styles.rowLabel}>
        <Ionicons color={tokens.textMuted} name={icon} size={15} />
        <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      </View>
      <Text text={value} size="xs" weight="semiBold" style={{ color: valueColor }} />
    </View>
  )
}

const styles = StyleSheet.create({
  centerStack: {
    alignItems: "center",
    gap: 6,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  content: {
    gap: 12,
    padding: 20,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
  },
  earningsCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  earningsCopy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  overtimeCard: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
  summaryCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
})
