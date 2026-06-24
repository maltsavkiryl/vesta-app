import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"

import type { DocumentItem } from "@/core/models"
import { translate } from "@/i18n/translate"
import { Banner, Text, appLayout, useDesignTokens } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"

import { getDocumentStatusConfig, shouldShowDocumentRowStatus } from "../documents.status"
import type { Payslip } from "../documents.types"
import { DocumentContractCard } from "./DocumentContractCard"
import { DocumentRowTail, DocumentStatusIcon, PayslipSummary } from "./DocumentRowAffordances"

export function AttentionBanner({ count, onPress }: { count: number; onPress: () => void }) {
  const tokens = useDesignTokens()
  if (count === 0) return null

  return (
    <Banner
      emphasis="outline"
      icon={<Ionicons color={tokens.danger} name="alert-circle-outline" size={15} />}
      onPress={onPress}
      tone="danger"
      trailing={
        <Text
          text={translate("documents:view")}
          size="xxs"
          weight="semiBold"
          style={{ color: tokens.danger }}
        />
      }
    >
      <Text
        text={translate("documents:uploadsStillNeeded", { count })}
        size="xxs"
        weight="medium"
        style={[styles.flex, { color: tokens.danger }]}
      />
    </Banner>
  )
}

export function RequiredDocumentRow({
  document,
  onPress,
}: {
  document: DocumentItem
  index?: number
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const status = getDocumentStatusConfig(tokens, document.status)
  const isMissing = document.status === "action_required"
  const showsStatusText = shouldShowDocumentRowStatus(document.status)
  const { animatedStyle, pressHandlers } = usePressScale({})

  return (
    <Animated.View style={[styles.documentRowElevation, { ...tokens.elevation1 }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.documentRow, { backgroundColor: tokens.surface }]}
        {...pressHandlers}
      >
        <DocumentStatusIcon
          backgroundColor={status.backgroundColor}
          color={status.color}
          icon={status.icon}
        />
        <View style={styles.flex}>
          <Text
            text={document.title}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text text={document.subtitle} size="xxs" style={{ color: tokens.textSecondary }} />
        </View>
        <DocumentRowTail
          accent={tokens.accent}
          accentForeground={tokens.accentForeground}
          actionLabel={isMissing ? translate("documents:upload") : translate("documents:view")}
          isMissing={isMissing}
          showStatusText={showsStatusText}
          statusBackgroundColor={status.backgroundColor}
          statusColor={status.color}
          statusLabel={status.label}
          textSecondary={tokens.textSecondary}
        />
      </Pressable>
    </Animated.View>
  )
}

export function PayslipRow({
  onPress,
  payslip,
}: {
  index?: number
  onPress: () => void
  payslip: Payslip
}) {
  const tokens = useDesignTokens()
  const { animatedStyle, pressHandlers } = usePressScale({})

  return (
    <Animated.View style={[styles.documentRowElevation, { ...tokens.elevation1 }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.documentRow, { backgroundColor: tokens.surface }]}
        {...pressHandlers}
      >
        <DocumentStatusIcon
          backgroundColor={tokens.successSoft}
          color={tokens.success}
          icon="cash-outline"
        />
        <View style={styles.flex}>
          <Text
            text={payslip.month}
            size="xs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={translate("documents:paidOn", { date: payslip.date })}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <PayslipSummary
          amount={payslip.net}
          muted={tokens.textMuted}
          primary={tokens.textPrimary}
        />
        <Ionicons color={tokens.textMuted} name="chevron-forward" size={15} />
      </Pressable>
    </Animated.View>
  )
}

export const ContractCard = DocumentContractCard

const styles = StyleSheet.create({
  documentRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 17,
    flexDirection: "row",
    gap: appLayout.rowGap,
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  documentRowElevation: {
    borderCurve: "continuous",
    borderRadius: 17,
  },
  flex: {
    flex: 1,
  },
})
