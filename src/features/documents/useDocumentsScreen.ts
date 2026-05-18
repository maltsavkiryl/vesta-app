import { useMemo, useState } from "react"

import { useDocumentActions } from "@/features/documents/data/documents.mutations"
import { useDocumentsStateQuery } from "@/features/documents/data/documents.queries"

import { payslips } from "./documents.data"
import type { DocumentCategory } from "./documents.types"
import { matchesQuery } from "./documents.utils"
import { showDocumentUploadOptions } from "./documentUploadFlow"

export function useDocumentsScreen() {
  const { documents, contracts } = useDocumentsStateQuery()
  const { uploadDocument } = useDocumentActions()
  const [category, setCategory] = useState<DocumentCategory>("required")
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const missingCount = useMemo(
    () => documents.filter((document) => document.status === "action_required").length,
    [documents],
  )
  const filteredDocuments = useMemo(
    () => documents.filter((document) => matchesQuery(query, document.title)),
    [documents, query],
  )
  const filteredPayslips = useMemo(
    () => payslips.filter((payslip) => matchesQuery(query, payslip.month)),
    [query],
  )
  const filteredContracts = useMemo(
    () => contracts.filter((contract) => matchesQuery(query, contract.name)),
    [contracts, query],
  )

  const openUploadOptions = (
    target: { id?: string; title: string } = { title: "Uploaded document" },
  ) => showDocumentUploadOptions({ target, uploadDocument })

  const cancelSearch = () => {
    setIsSearching(false)
    setQuery("")
  }

  return {
    cancelSearch,
    category,
    contracts,
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
  }
}
