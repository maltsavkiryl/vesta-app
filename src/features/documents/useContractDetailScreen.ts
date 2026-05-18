import { useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"

import { useDocumentActions } from "@/features/documents/data/documents.mutations"
import { useContractsQuery } from "@/features/documents/data/documents.queries"

import { findContract } from "./documents.utils"

export function useContractDetailScreen() {
  const router = useRouter()
  const { id, mode = "view" } = useLocalSearchParams<{ id: string; mode?: "view" | "sign" }>()
  const { signContract } = useDocumentActions()
  const contracts = useContractsQuery()
  const [signature, setSignature] = useState("")

  const contract = findContract(contracts, id)
  const canSign = Boolean(signature.trim())

  const signCurrentContract = () => {
    if (!contract || !canSign) return
    signContract(contract.id)
    router.back()
  }

  return {
    canSign,
    contract,
    mode,
    router,
    setSignature,
    signCurrentContract,
    signature,
  }
}
