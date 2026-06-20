import { useMemo } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatCurrency, formatNumber } from "@/core/format"
import { translate } from "@/i18n/translate"
import { ProgressBar, Text, useDesignTokens } from "@/ui"

function formatHoursWorked(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  if (minutes === 0) return `${formatNumber(wholeHours)}h`
  return `${formatNumber(wholeHours)}h ${minutes}m`
}

export function EarningsSummaryCard({
  averageHourlyRate,
  earnedAmount,
  hoursWorked,
  monthLabel,
  onPayslipPress,
  shiftsWorked,
  targetAmount,
}: {
  averageHourlyRate: number
  earnedAmount: number
  hoursWorked: number
  monthLabel: string
  onPayslipPress: () => void
  shiftsWorked: number
  targetAmount: number
}) {
  const tokens = useDesignTokens()
  const cardStyle = useMemo(
    () => ({
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
      ...tokens.elevation1,
    }),
    [tokens.border, tokens.elevation1, tokens.surface],
  )
  const amountStyle = useMemo(
    () => [styles.earningsAmount, { color: tokens.textPrimary }],
    [tokens.textPrimary],
  )
  const labelStyle = useMemo(() => ({ color: tokens.textSecondary }), [tokens.textSecondary])
  const progressPercent =
    targetAmount > 0 ? Math.min(Math.round((earnedAmount / targetAmount) * 100), 100) : 0
  const reachedTarget = targetAmount > 0 && earnedAmount >= targetAmount
  const progressPillStyle = useMemo(
    () => [
      styles.progressPill,
      { backgroundColor: reachedTarget ? tokens.successSoft : tokens.accentSoft },
    ],
    [reachedTarget, tokens.accentSoft, tokens.successSoft],
  )
  const progressPillColor = reachedTarget ? tokens.success : tokens.accent
  const linkStyle = useMemo(() => ({ color: tokens.accent }), [tokens.accent])
  const hoursLabel = formatHoursWorked(hoursWorked)

  const remainingLabel = reachedTarget
    ? translate("home:earnings.targetReached")
    : targetAmount > 0
      ? translate("home:earnings.remaining", {
          remaining: formatCurrency(Math.max(targetAmount - earnedAmount, 0)),
          target: formatCurrency(targetAmount),
        })
      : translate("home:earnings.averageRate", { rate: formatCurrency(averageHourlyRate) })

  const accessibilityLabel = `${monthLabel} earnings ${formatCurrency(earnedAmount)}${
    targetAmount > 0
      ? `, ${progressPercent} percent of your ${formatCurrency(targetAmount)} target`
      : ""
  }. ${hoursLabel} worked across ${shiftsWorked} shift${shiftsWorked === 1 ? "" : "s"}.`

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      style={[styles.earningsCard, cardStyle]}
    >
      <View style={styles.earningsTop}>
        <View style={styles.flex}>
          <Text text={translate("home:earnings.title", { month: monthLabel })} size="xxs" style={labelStyle} />
          <Text text={formatCurrency(earnedAmount)} weight="bold" style={amountStyle} />
        </View>
        {targetAmount > 0 ? (
          <View accessible={false} style={progressPillStyle}>
            <Text
              text={`${progressPercent}%`}
              size="xs"
              weight="bold"
              style={{ color: progressPillColor }}
            />
          </View>
        ) : null}
      </View>

      {targetAmount > 0 ? (
        <View accessible={false} style={styles.progressBlock}>
          <ProgressBar
            fillColor={reachedTarget ? tokens.success : tokens.accent}
            progress={progressPercent}
            thickness={8}
            trackColor={tokens.backgroundMuted}
          />
          <Text text={remainingLabel} size="xxs" style={labelStyle} />
        </View>
      ) : null}

      <View accessible={false} style={[styles.statsRow, { borderTopColor: tokens.border }]}>
        <View style={styles.statBlock}>
          <Text text={hoursLabel} weight="semiBold" style={{ color: tokens.textPrimary }} />
          <Text text={translate("home:earnings.hoursWorked")} size="xxs" style={labelStyle} />
        </View>
        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />
        <View style={styles.statBlock}>
          <Text
            text={formatNumber(shiftsWorked)}
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text text={translate("home:earnings.shiftsWorked")} size="xxs" style={labelStyle} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("home:earnings.viewPayslip")}
        onPress={onPayslipPress}
        style={styles.payslipLink}
      >
        <Ionicons color={tokens.accent} name="card-outline" size={14} />
        <Text text={translate("home:earnings.viewPayslip")} size="xxs" weight="medium" style={linkStyle} />
        <Ionicons color={tokens.accent} name="chevron-forward-outline" size={14} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  earningsAmount: {
    fontSize: 30,
    lineHeight: 36,
    marginTop: 3,
  },
  earningsCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
    padding: 16,
  },
  earningsTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex: {
    flex: 1,
  },
  payslipLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  progressBlock: {
    gap: 8,
  },
  progressPill: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statBlock: {
    flex: 1,
    gap: 2,
  },
  statDivider: {
    alignSelf: "stretch",
    width: StyleSheet.hairlineWidth,
  },
  statsRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 16,
    paddingTop: 14,
  },
})
