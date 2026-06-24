import { useState } from "react"
import { Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { useDocumentActions } from "@/features/documents/data/documents.mutations"
import { useContractsQuery } from "@/features/documents/data/documents.queries"
import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

import { findContract } from "./documents.utils"

export function useContractDetailScreen() {
  const router = useRouter()
  const { id, mode = "view" } = useLocalSearchParams<{ id: string; mode?: "view" | "sign" }>()
  const { signContract } = useDocumentActions()
  const { data: contracts } = useContractsQuery()
  const [signature, setSignature] = useState("")
  // Guards the sign punch against double-taps while the mutation is in flight.
  const [isSigning, setIsSigning] = useState(false)

  const contract = findContract(contracts ?? [], id)
  const canSign = Boolean(signature.trim())

  const signCurrentContract = async () => {
    if (!contract || !canSign || isSigning) return
    setIsSigning(true)
    try {
      const result = await signContract(contract.id)
      if (!result.ok) {
        fireHaptic("error")
        Alert.alert(translate("documents:signFailedTitle"), result.error.message)
        return
      }

      fireHaptic("success")
      router.back()
    } finally {
      setIsSigning(false)
    }
  }

  return {
    canSign,
    contract,
    isSigning,
    mode,
    router,
    setSignature,
    signCurrentContract,
    signature,
  }
}
