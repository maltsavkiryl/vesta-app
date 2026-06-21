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
  overtime: number
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

type ClockOutCelebrationData = {
  breakLabel: string
  workedLabel: string
}

/**
 * End-of-shift moment. Replaces the old auto-redirect: the employee sees their
 * recorded time is saved and dismisses when ready.
 */
export function ClockOutCelebration({
  data,
  onDone,
}: {
  data: ClockOutCelebrationData
  onDone: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.celebration}>
      <SuccessState
        icon="sparkles"
        subtitle="Your time is saved."
        title="Shift complete!"
        tone="success"
      >
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`${data.workedLabel} of payable time recorded, ${data.breakLabel} on break.`}
          style={styles.celebrationBody}
        >
          <View style={styles.successStats}>
            <View style={styles.statBlock}>
              <Text
                style={[appTypography.successTitle, { color: tokens.textPrimary }]}
                text={data.workedLabel}
                weight="bold"
              />
              <Text
                size="xxs"
                style={[styles.statLabel, { color: tokens.textSecondary }]}
                text="Worked"
              />
            </View>
            <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />
            <View style={styles.statBlock}>
              <Text
                style={[appTypography.successTitle, { color: tokens.textPrimary }]}
                text={data.breakLabel}
                weight="bold"
              />
              <Text
                size="xxs"
                style={[styles.statLabel, { color: tokens.textSecondary }]}
                text="Break"
              />
            </View>
          </View>
        </View>
      </SuccessState>

      <View style={styles.celebrationFooter}>
        <AppButton label="Done" onPress={onDone} />
      </View>
    </View>
  )
}

export function ClockOutContent({
  error,
  isFinishing = false,
  onFinish,
  onKeepWorking,
  summary,
}: {
  error?: string
  isFinishing?: boolean
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
        <DetailRow
          label="Break time"
          value={summary.breakLabel}
          valueTone="warning"
          isLast={summary.overtime === 0}
        />
        {summary.overtime > 0 ? (
          <DetailRow
            isLast
            label="Overtime"
            value={formatDurationLabel(summary.overtime)}
            valueTone="warning"
          />
        ) : null}
      </GroupedSection>

      <View style={styles.footerBlock}>
        {error ? (
          <Text
            size="xs"
            style={[styles.errorText, { color: tokens.danger }]}
            text={error}
            weight="medium"
          />
        ) : null}
        <View style={styles.footerActions}>
          <AppButton
            isLoading={isFinishing}
            label="Confirm clock out"
            onPress={() => {
              void onFinish()
            }}
            pressHaptic="none"
            variant="danger"
          />
          <AppButton
            disabled={isFinishing}
            label="Keep working"
            onPress={onKeepWorking}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  celebration: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  celebrationBody: {
    alignItems: "center",
    gap: 22,
  },
  celebrationFooter: {
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  content: {
    gap: 20,
    padding: 20,
  },
  errorText: {
    textAlign: "center",
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
