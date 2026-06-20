import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"

import { formatDurationLabel } from "@/core/date"
import { useAppMotion } from "@/providers/motion-provider"
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

type ClockOutCelebrationData = {
  breakLabel: string
  earnedToday: string
  shiftsWorked: number
  workedLabel: string
}

/**
 * Rewarding end-of-shift moment. Replaces the old 900ms auto-redirect: the
 * employee lingers on their earnings and dismisses when ready. Honours reduced
 * motion by rendering everything static (no pop-in, no shimmer).
 */
export function ClockOutCelebration({
  data,
  onDone,
}: {
  data: ClockOutCelebrationData
  onDone: () => void
}) {
  const tokens = useDesignTokens()
  const motion = useAppMotion()
  const amountScale = useSharedValue(motion.shouldReduceMotion ? 1 : 0.82)
  const amountOpacity = useSharedValue(motion.shouldReduceMotion ? 1 : 0)
  const glowOpacity = useSharedValue(motion.shouldReduceMotion ? 0.5 : 0)

  useEffect(() => {
    if (motion.shouldReduceMotion) return
    amountOpacity.value = withDelay(120, withTiming(1, { duration: 320 }))
    amountScale.value = withDelay(120, withSpring(1, { damping: 11, stiffness: 180 }))
    glowOpacity.value = withSequence(
      withDelay(120, withTiming(0.7, { duration: 360 })),
      withTiming(0.5, { duration: 420 }),
    )
  }, [amountOpacity, amountScale, glowOpacity, motion.shouldReduceMotion])

  const amountAnimatedStyle = useAnimatedStyle(() => ({
    opacity: amountOpacity.value,
    transform: [{ scale: amountScale.value }],
  }))
  const glowAnimatedStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }))

  return (
    <View style={styles.celebration}>
      <SuccessState
        icon="sparkles"
        subtitle="Your time is saved. Here's what you earned."
        title="Shift complete!"
        tone="success"
      >
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`You earned ${data.earnedToday} for ${data.workedLabel} of payable time. ${data.shiftsWorked} shifts worked this month.`}
          style={styles.celebrationBody}
        >
          <View style={styles.earnedTodayBlock}>
            <Text
              size="xxs"
              style={[styles.statLabel, { color: tokens.textSecondary }]}
              text="Earned this shift"
            />
            <View>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.earnedGlow,
                  { backgroundColor: tokens.successSoft },
                  glowAnimatedStyle,
                ]}
              />
              <Animated.View style={amountAnimatedStyle}>
                <Text
                  style={[styles.earnedAmount, { color: tokens.success }]}
                  text={data.earnedToday}
                  weight="bold"
                />
              </Animated.View>
            </View>
          </View>

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
                text={`${data.shiftsWorked}`}
                weight="bold"
              />
              <Text
                size="xxs"
                style={[styles.statLabel, { color: tokens.textSecondary }]}
                text="Shifts this month"
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
        <ClockOutPaySummary
          earnings={summary.earnings}
          rateLabel={summary.rateLabel}
          workedLabel={summary.workedLabel}
        />
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

function ClockOutPaySummary({
  earnings,
  rateLabel,
  workedLabel,
}: {
  earnings: string
  rateLabel: string
  workedLabel: string
}) {
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
          text={`${rateLabel} x ${workedLabel}`}
        />
      </View>
      <Text style={[styles.payValue, { color: tokens.success }]} text={earnings} weight="bold" />
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
  earnedAmount: {
    fontSize: 48,
    lineHeight: 54,
    textAlign: "center",
  },
  earnedGlow: {
    borderRadius: 999,
    bottom: 6,
    left: -12,
    position: "absolute",
    right: -12,
    top: 6,
  },
  earnedTodayBlock: {
    alignItems: "center",
    gap: 6,
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
