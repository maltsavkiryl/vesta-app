import type { ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"

import {
  ContractCard,
  PayslipRow,
  RequiredDocumentRow,
} from "@/features/documents/components/DocumentList"
import { DocumentsHeader } from "@/features/documents/components/DocumentsHeader"
import { shareContractPdf } from "@/features/documents/documentShare"
import { useDocumentsScreen } from "@/features/documents/useDocumentsScreen"
import { appLayout } from "@/ui"

import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

function LegalDocumentsContent() {
  const router = useRouter()
  const {
    cancelSearch,
    filteredDocuments,
    isSearching,
    openUploadOptions,
    query,
    setIsSearching,
    setQuery,
  } = useDocumentsScreen()

  return (
    <View style={styles.content}>
      <DocumentsHeader
        isSearching={isSearching}
        query={query}
        searchPlaceholder="Search legal documents..."
        showSearchButton={false}
        showTitle={false}
        showUploadButton={false}
        onCancelSearch={cancelSearch}
        onQueryChange={setQuery}
        onSearchPress={() => setIsSearching(true)}
        onUploadPress={() => openUploadOptions()}
      />
      <View style={styles.list}>
        {filteredDocuments.map((document) => (
          <RequiredDocumentRow
            key={document.id}
            document={document}
            onPress={() => {
              if (document.status === "action_required") {
                openUploadOptions({ id: document.id, title: document.title })
                return
              }

              if (document.uploadedUri) {
                router.push({
                  pathname: "/(app)/document-upload/[id]",
                  params: { id: document.id },
                } as never)
              }
            }}
          />
        ))}
      </View>
    </View>
  )
}

function ContractsContent() {
  const router = useRouter()
  const { cancelSearch, filteredContracts, isSearching, query, setIsSearching, setQuery } =
    useDocumentsScreen()

  return (
    <View style={styles.content}>
      <DocumentsHeader
        isSearching={isSearching}
        query={query}
        searchPlaceholder="Search contracts..."
        showSearchButton={false}
        showTitle={false}
        showUploadButton={false}
        onCancelSearch={cancelSearch}
        onQueryChange={setQuery}
        onSearchPress={() => setIsSearching(true)}
      />
      <View style={styles.contractList}>
        {filteredContracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onDownload={() => {
              void shareContractPdf(contract)
            }}
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
    </View>
  )
}

function PayslipsContent() {
  const router = useRouter()
  const { cancelSearch, filteredPayslips, isSearching, query, setIsSearching, setQuery } =
    useDocumentsScreen()

  return (
    <View style={styles.content}>
      <DocumentsHeader
        isSearching={isSearching}
        query={query}
        searchPlaceholder="Search payslips..."
        showSearchButton={false}
        showTitle={false}
        showUploadButton={false}
        onCancelSearch={cancelSearch}
        onQueryChange={setQuery}
        onSearchPress={() => setIsSearching(true)}
      />
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
    </View>
  )
}

export const DOCUMENTS_SECTION_CONTENT: Partial<
  Record<
    SectionKey,
    {
      editable: boolean
      render: (screen: ProfileDetailScreenState) => ReactNode
    }
  >
> = {
  "contracts": {
    editable: false,
    render: () => <ContractsContent />,
  },
  "legal-documents": {
    editable: false,
    render: () => <LegalDocumentsContent />,
  },
  "payslips": {
    editable: false,
    render: () => <PayslipsContent />,
  },
}

const styles = StyleSheet.create({
  content: {
    gap: appLayout.screenGap,
  },
  contractList: {
    gap: appLayout.groupedSectionGap,
  },
  list: {
    gap: 10,
    paddingHorizontal: 0,
  },
})
