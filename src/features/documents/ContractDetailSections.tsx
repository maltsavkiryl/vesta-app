import { Pressable, StyleSheet, TextInput, View } from "react-native"
import Animated from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

import type { DocumentContract } from "@/features/documents/data/documents.repository"
import { Banner, Text, appTypography, useDesignTokens } from "@/ui"
import { usePressScale } from "@/ui/composites/app-motion"
import { translate } from "@/i18n/translate"

import { shareContractPdf } from "./documentShare"

export function ContractDetailHero({
  contract,
  mode,
}: {
  contract: DocumentContract
  mode: "sign" | "view"
}) {
  const tokens = useDesignTokens()

  return (
    <View>
      <Text
        text={mode === "sign" ? translate("documents:signContract") : contract.name}
        weight="bold"
        style={[appTypography.detailTitle, { color: tokens.textPrimary }]}
      />
      <Text
        text={mode === "sign" ? contract.name : `${contract.type} · ${contract.date}`}
        size="xxs"
        style={{ color: tokens.textSecondary }}
      />
    </View>
  )
}

export function ContractPreview({
  body,
  mode,
}: {
  body: string
  mode: "sign" | "view"
}) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.preview,
        { backgroundColor: tokens.surface, ...tokens.elevation1 },
      ]}
    >
      <Text
        text={body}
        size="xxs"
        style={{
          color: mode === "sign" ? tokens.textSecondary : tokens.textPrimary,
          ...styles.contractBody,
        }}
      />
    </View>
  )
}

export function ContractSignatureSection({
  canSign,
  onChangeSignature,
  signature,
}: {
  canSign: boolean
  onChangeSignature: (value: string) => void
  signature: string
}) {
  const tokens = useDesignTokens()

  return (
    <>
      <Text
        tx="documents:yourSignature"
        size="xxs"
        weight="semiBold"
        style={[styles.caps, { color: tokens.textMuted }]}
      />
      <TextInput
        onChangeText={onChangeSignature}
        placeholder={translate("documents:signaturePlaceholder")}
        placeholderTextColor={tokens.textMuted}
        style={[
          styles.signatureInput,
          {
            backgroundColor: tokens.surface,
            borderColor: canSign ? tokens.accent : tokens.border,
            color: tokens.textPrimary,
          },
        ]}
        value={signature}
      />
      <Banner tone="warning">
        <Text
          tx="documents:signatureDisclaimer"
          size="xxs"
          style={{ color: tokens.warning }}
        />
      </Banner>
    </>
  )
}

export function ContractActionRow({
  contract,
  onSign,
}: {
  contract: DocumentContract
  onSign: () => void
}) {
  const tokens = useDesignTokens()
  const isPending = contract.status === "pending"
  const { animatedStyle: downloadAnim, pressHandlers: downloadHandlers } = usePressScale({})
  const { animatedStyle: signAnim, pressHandlers: signHandlers } = usePressScale({})

  return (
    <View style={styles.actions}>
      <Animated.View style={[styles.actionFlex, downloadAnim]}>
        <Pressable
          onPress={() => {
            void shareContractPdf(contract)
          }}
          style={[
            isPending ? styles.secondaryAction : styles.primaryAction,
            isPending
              ? { backgroundColor: tokens.surface, borderColor: tokens.border }
              : { backgroundColor: tokens.accent },
          ]}
          {...downloadHandlers}
        >
          <Ionicons
            color={isPending ? tokens.textPrimary : tokens.accentForeground}
            name="download-outline"
            size={14}
          />
          <Text
            tx="documents:downloadAction"
            size="xxs"
            weight={isPending ? "medium" : "semiBold"}
            style={{ color: isPending ? tokens.textPrimary : tokens.accentForeground }}
          />
        </Pressable>
      </Animated.View>
      {isPending ? (
        <Animated.View style={[styles.actionFlex, signAnim]}>
          <Pressable
            onPress={onSign}
            style={[styles.primaryAction, { backgroundColor: tokens.accent }]}
            {...signHandlers}
          >
            <Ionicons color={tokens.accentForeground} name="pencil-outline" size={14} />
            <Text
              tx="documents:signContract"
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  actionFlex: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  caps: {
    letterSpacing: 0,
  },
  contractBody: {
    lineHeight: 21,
  },
  preview: {
    borderCurve: "continuous",
    borderRadius: 14,
    maxHeight: 320,
    padding: 16,
  },
  primaryAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  secondaryAction: {
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
  signatureInput: {
    borderCurve: "continuous",
    borderRadius: 13,
    borderWidth: 1.5,
    fontSize: 17,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
})
