import { StyleSheet } from "react-native"
import { Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
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
  const {
    canSign,
    contract,
    isSigning,
    mode,
    router,
    setSignature,
    signCurrentContract,
    signature,
  } = useContractDetailScreen()
  const headerActions = createHeaderActionOptions(theme, {
    right:
      mode === "sign"
        ? {
            disabled: !canSign || isSigning,
            kind: "confirm",
            haptic: "none",
            label: translate("documents:sign"),
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
          title:
            mode === "sign" ? translate("documents:signContract") : translate("documents:title"),
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
          actionLabel={translate("common:actions.back")}
          icon={<Ionicons color={tokens.textMuted} name="document-text-outline" size={18} />}
          onAction={() => router.back()}
          subtitle={translate("documents:contractNotFoundSubtitle")}
          title={translate("documents:contractNotFound")}
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
