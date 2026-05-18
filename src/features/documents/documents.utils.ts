import { Ionicons } from "@expo/vector-icons"

import type { DesignTokens } from "@/ui"

import { initialContracts } from "./documents.data"
import type { Contract, DisplayDocumentStatus, DocumentStatusConfig } from "./documents.types"

export function matchesQuery(query: string, value: string) {
  return query ? value.toLowerCase().includes(query.toLowerCase()) : true
}

export function getDocumentStatusConfig(
  tokens: DesignTokens,
  status: DisplayDocumentStatus,
): DocumentStatusConfig & { icon: keyof typeof Ionicons.glyphMap } {
  const normalized = status === "action_required" ? "missing" : status
  const statusMap = {
    available: {
      backgroundColor: `${tokens.accent}14`,
      color: tokens.accent,
      icon: "document-text-outline",
      label: "Available",
    },
    missing: {
      backgroundColor: `${tokens.danger}14`,
      color: tokens.danger,
      icon: "alert-circle-outline",
      label: "Missing",
    },
    pending: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: "Pending",
    },
    processing: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: "Under review",
    },
    signed: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: "Signed",
    },
    verified: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: "Approved",
    },
  } satisfies Record<
    "available" | "missing" | "pending" | "processing" | "signed" | "verified",
    DocumentStatusConfig & { icon: keyof typeof Ionicons.glyphMap }
  >

  return statusMap[normalized]
}

export function getContracts(signedContractIds: string[]) {
  return initialContracts.map((contract) =>
    signedContractIds.includes(contract.id) ? { ...contract, status: "signed" as const } : contract,
  )
}

export function findContract(contracts: Contract[], id?: string) {
  return contracts.find((contract) => contract.id === id)
}
