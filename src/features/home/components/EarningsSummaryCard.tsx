import { useMemo } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"
import { formatCurrency } from "@/utils/formatters"

export function EarningsSummaryCard({
  earnedAmount,
  monthLabel,
  onPayslipPress,
}: {
  earnedAmount: number
  monthLabel: string
  onPayslipPress: () => void
}) {
  const tokens = useDesignTokens()
  const cardStyle = useMemo(
    () => ({
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
      shadowColor: tokens.shadow,
    }),
    [tokens.border, tokens.shadow, tokens.surface],
  )
  const amountStyle = useMemo(
    () => [styles.earningsAmount, { color: tokens.textPrimary }],
    [tokens.textPrimary],
  )
  const labelStyle = useMemo(() => ({ color: tokens.textSecondary }), [tokens.textSecondary])
  const trendIconStyle = useMemo(
    () => [styles.trendIcon, { backgroundColor: `${tokens.accent}14` }],
    [tokens.accent],
  )
  const linkStyle = useMemo(() => ({ color: tokens.accent }), [tokens.accent])

  return (
    <View style={[styles.earningsCard, cardStyle]}>
      <View style={styles.earningsTop}>
        <View style={styles.flex}>
          <Text text={`${monthLabel} earnings`} size="xxs" style={labelStyle} />
          <Text text={formatCurrency(earnedAmount)} weight="bold" style={amountStyle} />
        </View>
        <View style={trendIconStyle}>
          <Ionicons color={tokens.accent} name="trending-up-outline" size={19} />
        </View>
      </View>

      <Pressable onPress={onPayslipPress} style={styles.payslipLink}>
        <Ionicons color={tokens.accent} name="card-outline" size={14} />
        <Text text="View latest payslip" size="xxs" weight="medium" style={linkStyle} />
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
    elevation: 1,
    gap: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
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
  trendIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
})
