import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { formatDurationLabel } from "@/core/date"
import {
  AppButton,
  DetailRow,
  EmptyState,
  GroupedSection,
  SuccessState,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

type ClockOutSummaryData = {
  breakLabel: string
  clockOutTime: string
  earnings: string
  overtime: number
  rateLabel: string
  startedAtLabel: string
  workedLabel: string
}

export function ClockOutEmptyState() {
  const router = useRouter()
  const tokens = useDesignTokens()

  return (
    <EmptyState
      actionLabel="Back to Time"
      icon={<Ionicons color={tokens.textMuted} name="time-outline" size={18} />}
      onAction={() => router.replace("/(app)/(tabs)/time")}
      subtitle="You're not currently clocked in."
      title="No active session"
    />
  )
}

export function ClockOutSuccessState({
  earnings,
  workedLabel,
}: {
  earnings: string
  workedLabel: string
}) {
  const tokens = useDesignTokens()

  return (
    <SuccessState subtitle="Your time has been saved." title="Clocked out">
      <View style={styles.successStats}>
        <View style={styles.statBlock}>
          <Text
            style={[appTypography.successTitle, { color: tokens.textPrimary }]}
            text={workedLabel}
            weight="bold"
          />
          <Text size="xxs" style={[styles.statLabel, { color: tokens.textSecondary }]} text="Worked" />
        </View>
        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />
        <View style={styles.statBlock}>
          <Text
            style={[appTypography.successTitle, { color: tokens.success }]}
            text={`€${earnings}`}
            weight="bold"
          />
          <Text
            size="xxs"
            style={[styles.statLabel, { color: tokens.textSecondary }]}
            text="Est. pay"
          />
        </View>
      </View>
    </SuccessState>
  )
}

export function ClockOutContent({
  onFinish,
  onKeepWorking,
  summary,
}: {
  onFinish: () => void | Promise<void>
  onKeepWorking: () => void
  summary: ClockOutSummaryData
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.content}>
      <View style={styles.summaryIntro}>
        <Text
          style={[appTypography.heroValue, styles.heroValue, { color: tokens.textPrimary }]}
          text={summary.workedLabel}
          weight="bold"
        />
      </View>

      <GroupedSection title="Shift summary">
        <DetailRow label="Clocked in" value={summary.startedAtLabel} />
        <DetailRow label="Clocked out" value={summary.clockOutTime} />
        <DetailRow label="Break time" value={summary.breakLabel} valueTone="warning" />
        {summary.overtime > 0 ? (
          <DetailRow
            isLast
            label="Overtime"
            value={formatDurationLabel(summary.overtime)}
            valueTone="warning"
          />
        ) : (
          <DetailRow isLast label="Hourly rate" value={summary.rateLabel} />
        )}
      </GroupedSection>

      <GroupedSection title="Pay estimate">
        <ClockOutPaySummary earnings={summary.earnings} workedLabel={summary.workedLabel} />
      </GroupedSection>

      <View style={styles.footerBlock}>
        <View style={styles.footerActions}>
          <AppButton
            label="Confirm clock out"
            onPress={() => {
              void onFinish()
            }}
            pressHaptic="none"
            variant="danger"
          />
          <AppButton label="Keep working" onPress={onKeepWorking} variant="secondary" />
        </View>
      </View>
    </View>
  )
}

function ClockOutPaySummary({ earnings, workedLabel }: { earnings: string; workedLabel: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.payRow}>
      <View style={styles.payCopy}>
        <Text
          size="xs"
          style={{ color: tokens.textPrimary }}
          text="Estimated earnings"
          weight="medium"
        />
        <Text
          size="xxs"
          style={{ color: tokens.textSecondary }}
          text={`€12.02/hr x ${workedLabel}`}
        />
      </View>
      <Text
        style={[styles.payValue, { color: tokens.success }]}
        text={`€${earnings}`}
        weight="bold"
      />
    </View>
  )
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
