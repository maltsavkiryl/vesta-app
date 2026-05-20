import { StyleSheet } from "react-native"
import { Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  AppScrollScreen,
  EmptyState,
  appLayout,
  createHeaderActionOptions,
  useAppTheme,
  useDesignTokens,
} from "@/ui"

import {
  ContractActionRow,
  ContractDetailHero,
  ContractPreview,
  ContractSignatureSection,
} from "./ContractDetailSections"
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
            haptic: "none",
            label: "Sign",
            onPress: signCurrentContract,
          }
        : undefined,
  })

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.content}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <Stack.Screen
        options={{
          ...headerActions,
          title: mode === "sign" ? "Sign contract" : "Contract",
        }}
      />
      {contract ? (
        <>
          <ContractDetailHero contract={contract} mode={mode} />
          <ContractPreview body={contract.body} mode={mode} />
          {mode === "sign" ? (
            <ContractSignatureSection
              canSign={canSign}
              onChangeSignature={setSignature}
              signature={signature}
            />
          ) : (
            <ContractActionRow
              contract={contract}
              onSign={() =>
                router.replace({
                  pathname: "/(app)/document-contract/[id]",
                  params: { id: contract.id, mode: "sign" },
                } as never)
              }
            />
          )}
        </>
      ) : (
        <EmptyState
          actionLabel="Back"
          icon={<Ionicons color={tokens.textMuted} name="document-text-outline" size={18} />}
          onAction={() => router.back()}
          subtitle="This contract is no longer available in your local documents list."
          title="Contract not found"
        />
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: appLayout.sheetGap,
    paddingBottom: appLayout.sheetPaddingBottom,
    paddingHorizontal: appLayout.sheetPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
})
