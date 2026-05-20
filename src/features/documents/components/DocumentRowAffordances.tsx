import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

type DocumentStatusIconProps = {
  backgroundColor: string
  color: string
  icon: keyof typeof Ionicons.glyphMap
}

export function DocumentStatusIcon({ backgroundColor, color, icon }: DocumentStatusIconProps) {
  return (
    <View style={[styles.statusIcon, { backgroundColor }]}>
      <Ionicons color={color} name={icon} size={18} />
    </View>
  )
}

export function DocumentRowTail({
  actionLabel,
  accent,
  accentForeground,
  isMissing,
  showStatusText,
  statusBackgroundColor,
  statusColor,
  statusLabel,
  textSecondary,
}: {
  actionLabel: "Upload" | "View"
  accent: string
  accentForeground: string
  isMissing: boolean
  showStatusText: boolean
  statusBackgroundColor: string
  statusColor: string
  statusLabel: string
  textSecondary: string
}) {
  return (
    <View style={styles.rowTail}>
      {showStatusText ? (
        <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
          <Text text={statusLabel} size="xxs" weight="medium" style={{ color: statusColor }} />
        </View>
      ) : null}
      {isMissing ? (
        <View style={[styles.inlineAction, { backgroundColor: accent }]}>
          <Text text={actionLabel} size="xxs" weight="semiBold" style={{ color: accentForeground }} />
        </View>
      ) : (
        <View style={styles.eyeButton}>
          <Ionicons color={textSecondary} name="eye-outline" size={14} />
        </View>
      )}
    </View>
  )
}

export function PayslipSummary({
  amount,
  muted,
  primary,
}: {
  amount: string
  muted: string
  primary: string
}) {
  return (
    <View style={styles.payslipTail}>
      <Text text={amount} size="xs" weight="bold" style={{ color: primary }} />
      <Text text="Net pay" size="xxs" style={{ color: muted }} />
    </View>
  )
}

const styles = StyleSheet.create({
  eyeButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  inlineAction: {
    borderCurve: "continuous",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  payslipTail: {
    alignItems: "flex-end",
  },
  rowTail: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    borderCurve: "continuous",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
})
