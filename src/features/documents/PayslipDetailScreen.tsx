import { StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  AppScrollScreen,
  EmptyState,
  Text,
  appLayout,
  appTypography,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"

import { payslips } from "./documents.data"
import { sharePayslipPdf } from "./documentShare"

export function PayslipDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const { theme } = useAppTheme()
  const payslip = payslips.find((item) => item.id === id)
  const headerActions = payslip
    ? createHeaderActionOptions(theme, {
        right: {
          accessibilityLabel: "Download payslip PDF",
          iconName: "cloud-download-outline",
          iosIconName: "icloud.and.arrow.down",
          kind: "icon",
          onPress: () => {
            void sharePayslipPdf(payslip)
          },
          prominent: true,
        },
      })
    : undefined

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.content}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <Stack.Screen
        options={{
          ...headerActions,
          title: "Payslip",
        }}
      />
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
      ) : (
        <EmptyState
          actionLabel="Back"
          icon={<Ionicons color={tokens.textMuted} name="cash-outline" size={18} />}
          onAction={() => router.back()}
          subtitle="This payslip is no longer available in the current local list."
          title="Payslip not found"
        />
      )}
    </AppScrollScreen>
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
  netPayHero: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
})
