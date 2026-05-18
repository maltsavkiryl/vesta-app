import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"

import { AppScrollScreen, appLayout } from "@/ui"

import {
  AttentionBanner,
  CategoryPicker,
  ContractCard,
  PayslipRow,
  RequiredDocumentRow,
} from "./components/DocumentList"
import { DocumentsHeader } from "./components/DocumentsHeader"
import { useDocumentsScreen } from "./useDocumentsScreen"

export function DocumentsScreen() {
  const router = useRouter()
  const {
    cancelSearch,
    category,
    filteredContracts,
    filteredDocuments,
    filteredPayslips,
    isSearching,
    missingCount,
    openUploadOptions,
    query,
    setCategory,
    setIsSearching,
    setQuery,
  } = useDocumentsScreen()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <DocumentsHeader
        isSearching={isSearching}
        query={query}
        onCancelSearch={cancelSearch}
        onQueryChange={setQuery}
        onSearchPress={() => setIsSearching(true)}
        onUploadPress={() => openUploadOptions()}
      />

      {!isSearching ? (
        <AttentionBanner count={missingCount} onPress={() => setCategory("required")} />
      ) : null}

      <CategoryPicker value={category} onChange={setCategory} />

      {category === "required" ? (
        <View style={styles.list}>
          {filteredDocuments.map((document) => (
            <RequiredDocumentRow
              key={document.id}
              document={document}
              onPress={() => {
                if (document.status === "action_required") {
                  openUploadOptions({ id: document.id, title: document.title })
                }
              }}
            />
          ))}
        </View>
      ) : null}

      {category === "payslips" ? (
        <View style={styles.list}>
          {filteredPayslips.map((payslip) => (
            <PayslipRow
              key={payslip.id}
              payslip={payslip}
              onPress={() =>
                router.push({
                  pathname: "/(app)/document-payslip/[id]",
                  params: { id: payslip.id },
                } as never)
              }
            />
          ))}
        </View>
      ) : null}

      {category === "contracts" ? (
        <View style={styles.contractList}>
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onDownload={() => undefined}
              onSign={() =>
                router.push({
                  pathname: "/(app)/document-contract/[id]",
                  params: { id: contract.id, mode: "sign" },
                } as never)
              }
              onView={() =>
                router.push({
                  pathname: "/(app)/document-contract/[id]",
                  params: { id: contract.id, mode: "view" },
                } as never)
              }
            />
          ))}
        </View>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  contractList: {
    gap: appLayout.groupedSectionGap,
  },
  list: {
    paddingHorizontal: 0,
  },
  screen: {
    gap: appLayout.screenGap,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
  },
})
