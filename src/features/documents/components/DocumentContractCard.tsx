import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated from "react-native-reanimated"

import { translate } from "@/i18n/translate"
import { Text, appLayout, useDesignTokens } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"

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
    <View style={[styles.contractCard, { backgroundColor: tokens.surface, ...tokens.elevation1 }]}>
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
          label={translate("documents:view")}
          onPress={onView}
          baseStyle={[
            styles.contractSecondary,
            { backgroundColor: tokens.background, borderColor: tokens.border },
          ]}
          textColor={tokens.textPrimary}
        />
        {contract.status === "pending" ? (
          <ContractActionButton
            icon="pencil-outline"
            label={translate("documents:reviewSign")}
            onPress={onSign}
            baseStyle={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
            textColor={tokens.accentForeground}
            weight="semiBold"
          />
        ) : (
          <ContractActionButton
            icon="download-outline"
            label={translate("documents:downloadAction")}
            onPress={onDownload}
            baseStyle={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
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
  baseStyle,
  textColor,
  weight = "medium",
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  baseStyle: object | object[]
  textColor: string
  weight?: "medium" | "semiBold"
}) {
  const { animatedStyle, pressHandlers } = usePressScale({})

  return (
    <Animated.View style={[styles.actionFlex, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.actionBase, ...(Array.isArray(baseStyle) ? baseStyle : [baseStyle])]}
        {...pressHandlers}
      >
        <Ionicons color={textColor} name={icon} size={14} />
        <Text text={label} size="xxs" weight={weight} style={{ color: textColor }} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  actionBase: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  actionFlex: {
    flex: 1,
  },
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
    borderWidth: 0,
  },
  contractSecondary: {
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
})
