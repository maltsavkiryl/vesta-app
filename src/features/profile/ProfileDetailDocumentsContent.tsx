import type { ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  ContractCard,
  PayslipRow,
  RequiredDocumentRow,
} from "@/features/documents/components/DocumentList"
import { DocumentsHeader } from "@/features/documents/components/DocumentsHeader"
import { payslips } from "@/features/documents/documents.data"
import { shareContractPdf } from "@/features/documents/documentShare"
import { useDocumentsScreen } from "@/features/documents/useDocumentsScreen"
import { EmptyState, Skeleton, SurfaceCard, appLayout, useDesignTokens } from "@/ui"

import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

function DocumentsEmptyState({
  actionLabel,
  iconName,
  onAction,
  subtitle,
  title,
}: {
  actionLabel?: string
  iconName: keyof typeof Ionicons.glyphMap
  onAction?: () => void
  subtitle: string
  title: string
}) {
  const tokens = useDesignTokens()

  return (
    <EmptyState
      actionLabel={actionLabel}
      icon={<Ionicons color={tokens.textMuted} name={iconName} size={18} />}
      onAction={onAction}
      subtitle={subtitle}
      title={title}
    />
  )
}

function DocumentsListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View
      accessibilityLabel="Loading documents"
      accessibilityState={{ busy: true }}
      style={styles.list}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <SurfaceCard key={index} style={styles.skeletonRow}>
          <Skeleton height={36} radius={11} width={36} />
          <View style={styles.skeletonRowCopy}>
            <Skeleton height={12} width="70%" />
            <Skeleton height={10} width="45%" />
          </View>
        </SurfaceCard>
      ))}
    </View>
  )
}

function DocumentsErrorState({ onRetry, subtitle }: { onRetry: () => void; subtitle: string }) {
  return (
    <EmptyState
      actionLabel="Try again"
      onAction={onRetry}
      subtitle={subtitle}
      title="Couldn't load documents"
    />
  )
}

function LegalDocumentsContent() {
  const router = useRouter()
  const {
    cancelSearch,
    filteredDocuments,
    isError,
    isLoading,
    isSearching,
    openUploadOptions,
    query,
    refetch,
    setQuery,
  } = useDocumentsScreen()
  const hasSearchQuery = query.trim().length > 0

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
      />
      <View style={styles.list}>
        {isLoading ? (
          <DocumentsListSkeleton />
        ) : isError ? (
          <DocumentsErrorState
            onRetry={refetch}
            subtitle="We couldn't load your required documents. Check your connection and try again."
          />
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
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
          ))
        ) : (
          <DocumentsEmptyState
            actionLabel={hasSearchQuery ? "Clear search" : undefined}
            iconName="document-text-outline"
            onAction={hasSearchQuery ? cancelSearch : undefined}
            subtitle={
              hasSearchQuery
                ? "Try another search term or clear the filter to see every required document."
                : "Anything that needs an upload or review will appear here."
            }
            title={hasSearchQuery ? "No matching legal documents" : "Nothing needed right now"}
          />
        )}
      </View>
    </View>
  )
}

function ContractsContent() {
  const router = useRouter()
  const {
    cancelSearch,
    filteredContracts,
    isError,
    isLoading,
    isSearching,
    query,
    refetch,
    setQuery,
  } = useDocumentsScreen()
  const hasSearchQuery = query.trim().length > 0

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
      />
      <View style={styles.contractList}>
        {isLoading ? (
          <DocumentsListSkeleton rows={2} />
        ) : isError ? (
          <DocumentsErrorState
            onRetry={refetch}
            subtitle="We couldn't load your contracts. Check your connection and try again."
          />
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => (
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
          ))
        ) : (
          <DocumentsEmptyState
            actionLabel={hasSearchQuery ? "Clear search" : undefined}
            iconName="document-attach-outline"
            onAction={hasSearchQuery ? cancelSearch : undefined}
            subtitle={
              hasSearchQuery
                ? "Try a different contract name or clear the search."
                : "Signed and pending agreements will appear here when your employer sends them."
            }
            title={hasSearchQuery ? "No matching contracts" : "No contracts on file"}
          />
        )}
      </View>
    </View>
  )
}

function PayslipsContent() {
  const router = useRouter()
  const { cancelSearch, filteredPayslips, isSearching, query, setQuery } = useDocumentsScreen()
  const hasSearchQuery = query.trim().length > 0

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
      />
      <View style={styles.list}>
        {filteredPayslips.length > 0 ? (
          filteredPayslips.map((payslip) => (
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
          ))
        ) : (
          <DocumentsEmptyState
            actionLabel={hasSearchQuery ? "Clear search" : undefined}
            iconName="cash-outline"
            onAction={hasSearchQuery ? cancelSearch : undefined}
            subtitle={
              hasSearchQuery
                ? "Try a different month or clear the search."
                : "Payslips will show up here after payroll is published."
            }
            title={
              hasSearchQuery
                ? "No matching payslips"
                : payslips.length === 0
                  ? "No payslips yet"
                  : "No matching payslips"
            }
          />
        )}
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
  skeletonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  skeletonRowCopy: {
    flex: 1,
    gap: 8,
  },
})
