import type { DocumentItem } from "@/core/models"

import { initialContracts } from "./documents.data"
import type { Contract } from "./documents.types"

export function matchesQuery(query: string, value: string) {
  return query ? value.toLowerCase().includes(query.toLowerCase()) : true
}

export function isRequiredDocument(document: DocumentItem) {
  return document.status === "action_required" || document.status === "processing"
}

export function getContracts(signedContractIds: string[]) {
  return initialContracts.map((contract) =>
    signedContractIds.includes(contract.id) ? { ...contract, status: "signed" as const } : contract,
  )
}

export function findContract(contracts: Contract[], id?: string) {
  return contracts.find((contract) => contract.id === id)
}

export function findDocument(documents: DocumentItem[], id?: string) {
  return documents.find((document) => document.id === id)
}
