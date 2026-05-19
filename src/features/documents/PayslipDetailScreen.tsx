import { StyleSheet, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AppButton, AppScrollScreen, Text, appLayout, appTypography, useDesignTokens } from "@/ui"

import { payslips } from "./documents.data"
import { sharePayslipPdf } from "./documentShare"

export function PayslipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const insets = useSafeAreaInsets()
  const payslip = payslips.find((item) => item.id === id)

  return (
    <View style={[styles.screen, { backgroundColor: tokens.groupedBackground }]}>
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.content}
        style={[styles.flex, { backgroundColor: tokens.groupedBackground }]}
      >
        {payslip ? (
          <>
            <View>
              <Text
                text={payslip.month}
                weight="bold"
                style={[appTypography.detailTitle, { color: tokens.textPrimary }]}
              />
              <Text text={payslip.period} size="xxs" style={{ color: tokens.textSecondary }} />
            </View>
            <View
              style={[
                styles.netPayHero,
                { backgroundColor: `${tokens.success}10`, borderColor: `${tokens.success}22` },
              ]}
            >
              <Text
                text="NET PAY"
                size="xxs"
                weight="semiBold"
                style={[styles.caps, { color: tokens.success }]}
              />
              <Text
                text={payslip.net}
                weight="bold"
                style={[appTypography.heroValue, { color: tokens.textPrimary }]}
              />
              <Text
                text={`Paid ${payslip.date}`}
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
            <Text
              text="BREAKDOWN"
              size="xxs"
              weight="semiBold"
              style={[styles.caps, { color: tokens.textMuted }]}
            />
            <View style={[styles.breakdown, { backgroundColor: tokens.surface }]}>
              {payslip.rows.map((row) => (
                <View
                  key={row.label}
                  style={[styles.breakdownRow, { borderBottomColor: tokens.border }]}
                >
                  <Text
                    text={row.label}
                    size="xxs"
                    style={[styles.flex, { color: tokens.textSecondary }]}
                  />
                  <Text
                    text={row.amount}
                    size="xxs"
                    weight="semiBold"
                    style={{ color: row.type === "minus" ? tokens.danger : tokens.success }}
                  />
                </View>
              ))}
            </View>
          </>
        ) : null}
      </AppScrollScreen>
      {payslip ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: tokens.groupedBackground,
              borderTopColor: tokens.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <AppButton
            label="Download PDF"
            onPress={() => {
              void sharePayslipPdf(payslip)
            }}
          />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  breakdown: {
    borderCurve: "continuous",
    borderRadius: 14,
    marginBottom: 4,
    overflow: "hidden",
  },
  breakdownRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  caps: {
    letterSpacing: 0,
  },
  content: {
    gap: appLayout.sheetGap,
    paddingBottom: appLayout.sheetPaddingBottom,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
  flex: {
    flex: 1,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: 14,
  },
  netPayHero: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  screen: {
    flex: 1,
  },
})
