import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, appLayout, useDesignTokens } from "@/ui"

import { getDocumentStatusConfig } from "../documents.status"
import type { Contract } from "../documents.types"

import { DocumentStatusIcon } from "./DocumentRowAffordances"

export function DocumentContractCard({
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
        <DocumentStatusIcon
          backgroundColor={status.backgroundColor}
          color={status.color}
          icon={status.icon}
        />
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
        <ContractActionButton
          icon="eye-outline"
          label="View"
          onPress={onView}
          style={[
            styles.contractSecondary,
            { backgroundColor: tokens.background, borderColor: tokens.border },
          ]}
          textColor={tokens.textPrimary}
        />
        {contract.status === "pending" ? (
          <ContractActionButton
            icon="pencil-outline"
            label="Review & sign"
            onPress={onSign}
            style={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
            textColor={tokens.accentForeground}
            weight="semiBold"
          />
        ) : (
          <ContractActionButton
            icon="download-outline"
            label="Download"
            onPress={onDownload}
            style={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
            textColor={tokens.accentForeground}
            weight="semiBold"
          />
        )}
      </View>
    </View>
  )
}

function ContractActionButton({
  icon,
  label,
  onPress,
  style,
  textColor,
  weight = "medium",
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  style: object | object[]
  textColor: string
  weight?: "medium" | "semiBold"
}) {
  return (
    <Pressable onPress={onPress} style={style}>
      <Ionicons color={textColor} name={icon} size={14} />
      <Text text={label} size="xxs" weight={weight} style={{ color: textColor }} />
    </Pressable>
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
  flex: {
    flex: 1,
  },
})
