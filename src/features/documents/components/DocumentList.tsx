import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { DocumentItem } from "@/core/models"
import { AppSegmentedControl, Banner, Text, appLayout, useDesignTokens } from "@/ui"

import { documentCategories } from "../documents.data"
import type { Contract, DocumentCategory, Payslip } from "../documents.types"
import { getDocumentStatusConfig } from "../documents.utils"

export function AttentionBanner({ count, onPress }: { count: number; onPress: () => void }) {
  const tokens = useDesignTokens()
  if (count === 0) return null

  return (
    <Banner
      emphasis="outline"
      icon={<Ionicons color={tokens.danger} name="alert-circle-outline" size={15} />}
      onPress={onPress}
      tone="danger"
      trailing={<Text text="View" size="xxs" weight="semiBold" style={{ color: tokens.danger }} />}
    >
      <Text
        text={`${count} document${count > 1 ? "s" : ""} need${count === 1 ? "s" : ""} attention`}
        size="xxs"
        weight="medium"
        style={[styles.flex, { color: tokens.danger }]}
      />
    </Banner>
  )
}

export function CategoryPicker({
  onChange,
  value,
}: {
  onChange: (category: DocumentCategory) => void
  value: DocumentCategory
}) {
  return (
    <AppSegmentedControl
      onChange={onChange}
      options={documentCategories.map((category) => ({
        label: category.label,
        value: category.id,
      }))}
      value={value}
    />
  )
}

export function RequiredDocumentRow({
  document,
  onPress,
}: {
  document: DocumentItem
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const status = getDocumentStatusConfig(tokens, document.status)
  const isMissing = document.status === "action_required"

  return (
    <Pressable onPress={onPress} style={[styles.documentRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.statusIcon, { backgroundColor: status.backgroundColor }]}>
        <Ionicons color={status.color} name={status.icon} size={18} />
      </View>
      <View style={styles.flex}>
        <Text
          text={document.title}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={isMissing ? document.subtitle : `${document.category} · ${document.subtitle}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={styles.rowTail}>
        <Text text={status.label} size="xxs" weight="medium" style={{ color: status.color }} />
        {isMissing ? (
          <View style={[styles.inlineUpload, { backgroundColor: tokens.accent }]}>
            <Text
              text="Upload"
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </View>
        ) : (
          <View style={[styles.eyeButton, { backgroundColor: tokens.surface }]}>
            <Ionicons color={tokens.textSecondary} name="eye-outline" size={14} />
          </View>
        )}
      </View>
    </Pressable>
  )
}

export function PayslipRow({ onPress, payslip }: { onPress: () => void; payslip: Payslip }) {
  const tokens = useDesignTokens()

  return (
    <Pressable onPress={onPress} style={[styles.documentRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.statusIcon, { backgroundColor: `${tokens.success}14` }]}>
        <Ionicons color={tokens.success} name="cash-outline" size={18} />
      </View>
      <View style={styles.flex}>
        <Text
          text={payslip.month}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={`Paid ${payslip.date}`} size="xxs" style={{ color: tokens.textSecondary }} />
      </View>
      <View style={styles.payslipTail}>
        <Text text={payslip.net} size="xs" weight="bold" style={{ color: tokens.textPrimary }} />
        <Text text="Net pay" size="xxs" style={{ color: tokens.textMuted }} />
      </View>
      <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
    </Pressable>
  )
}

export function ContractCard({
  contract,
  onDownload,
  onSign,
  onView,
}: {
  contract: Contract
  onDownload: () => void
  onSign: () => void
  onView: () => void
}) {
  const tokens = useDesignTokens()
  const status = getDocumentStatusConfig(tokens, contract.status)

  return (
    <View style={[styles.contractCard, { backgroundColor: tokens.surface }]}>
      <View style={styles.contractHeader}>
        <View style={[styles.statusIcon, { backgroundColor: status.backgroundColor }]}>
          <Ionicons color={status.color} name={status.icon} size={18} />
        </View>
        <View style={styles.flex}>
          <Text
            text={contract.name}
            size="xs"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${contract.type} · ${contract.date}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Text text={status.label} size="xxs" weight="semiBold" style={{ color: status.color }} />
      </View>
      <View style={styles.contractActions}>
        <Pressable
          onPress={onView}
          style={[
            styles.contractSecondary,
            { backgroundColor: tokens.background, borderColor: tokens.border },
          ]}
        >
          <Ionicons color={tokens.textPrimary} name="eye-outline" size={14} />
          <Text text="View" size="xxs" weight="medium" style={{ color: tokens.textPrimary }} />
        </Pressable>
        {contract.status === "pending" ? (
          <Pressable
            onPress={onSign}
            style={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
          >
            <Ionicons color={tokens.accentForeground} name="pencil-outline" size={14} />
            <Text
              text="Review & sign"
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={onDownload}
            style={[
              styles.contractPrimary,
              {
                backgroundColor: `${tokens.success}10`,
                borderColor: `${tokens.success}22`,
              },
              styles.contractPrimaryBorder,
            ]}
          >
            <Ionicons color={tokens.success} name="download-outline" size={14} />
            <Text text="Download" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  contractActions: {
    flexDirection: "row",
    gap: 8,
  },
  contractCard: {
    borderCurve: "continuous",
    borderRadius: 17,
    gap: appLayout.cardGap,
    padding: 16,
  },
  contractHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  contractPrimary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 2,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  contractPrimaryBorder: {
    borderWidth: 1,
  },
  contractSecondary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  documentRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: appLayout.rowGap,
    minHeight: 68,
    paddingVertical: 14,
  },
  eyeButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  flex: {
    flex: 1,
  },
  inlineUpload: {
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
  statusIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
})
