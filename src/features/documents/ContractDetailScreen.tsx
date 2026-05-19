import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  AppScrollScreen,
  Banner,
  Text,
  appLayout,
  appTypography,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"

import { useContractDetailScreen } from "./useContractDetailScreen"

export function ContractDetailScreen() {
  const tokens = useDesignTokens()
  const { theme } = useAppTheme()
  const { canSign, contract, mode, router, setSignature, signCurrentContract, signature } =
    useContractDetailScreen()
  const headerActions = createHeaderActionOptions(theme, {
    right:
      mode === "sign"
        ? {
            disabled: !canSign,
            kind: "confirm",
            label: "Sign",
            onPress: signCurrentContract,
          }
        : undefined,
  })

  return (
    <AppScrollScreen
      contentContainerStyle={styles.content}
      style={{ backgroundColor: tokens.background }}
    >
      <Stack.Screen
        options={{
          ...headerActions,
          title: mode === "sign" ? "Sign contract" : "Contract",
        }}
      />
      {contract ? (
        <>
          <View>
            <Text
              text={mode === "sign" ? "Sign contract" : contract.name}
              weight="bold"
              style={[appTypography.detailTitle, { color: tokens.textPrimary }]}
            />
            <Text
              text={mode === "sign" ? contract.name : `${contract.type} · ${contract.date}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <View style={[styles.preview, { backgroundColor: tokens.background }]}>
            <Text
              text={contract.body}
              size="xxs"
              style={{
                color: mode === "sign" ? tokens.textSecondary : tokens.textPrimary,
                ...styles.contractBody,
              }}
            />
          </View>
          {mode === "sign" ? (
            <>
              <Text
                text="YOUR SIGNATURE"
                size="xxs"
                weight="semiBold"
                style={[styles.caps, { color: tokens.textMuted }]}
              />
              <TextInput
                onChangeText={setSignature}
                placeholder="Type your full legal name..."
                placeholderTextColor={tokens.textMuted}
                style={[
                  styles.signatureInput,
                  {
                    borderColor: signature ? tokens.accent : tokens.border,
                    color: tokens.textPrimary,
                  },
                ]}
                value={signature}
              />
              <Banner tone="warning">
                <Text
                  text="By signing, you confirm you have read and agree to all terms of this document."
                  size="xxs"
                  style={{ color: tokens.warning }}
                />
              </Banner>
            </>
          ) : (
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.secondaryAction,
                  { backgroundColor: tokens.background, borderColor: tokens.border },
                ]}
              >
                <Ionicons color={tokens.textPrimary} name="download-outline" size={14} />
                <Text
                  text="Download"
                  size="xxs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
              </Pressable>
              {contract.status === "pending" ? (
                <Pressable
                  onPress={() =>
                    router.replace({
                      pathname: "/(app)/document-contract/[id]",
                      params: { id: contract.id, mode: "sign" },
                    } as never)
                  }
                  style={[styles.primaryAction, { backgroundColor: tokens.accent }]}
                >
                  <Ionicons color={tokens.accentForeground} name="pencil-outline" size={14} />
                  <Text
                    text="Sign contract"
                    size="xxs"
                    weight="semiBold"
                    style={{ color: tokens.accentForeground }}
                  />
                </Pressable>
              ) : null}
            </View>
          )}
        </>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
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
    flex: 2,
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
