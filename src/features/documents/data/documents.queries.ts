import { useMemo } from "react"

import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

import { getContracts } from "../documents.utils"

export function useDocumentsQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => state.documents)
}

export function useSignedContractIdsQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => state.signedContractIds)
}

export function useContractsQuery() {
  const signedContractIdsQuery = useSignedContractIdsQuery()

  return useMemo(
    () => getContracts(signedContractIdsQuery.data ?? []),
    [signedContractIdsQuery.data],
  )
}

export function useDocumentsStateQuery() {
  const documentsQuery = useDocumentsQuery()
  const contracts = useContractsQuery()

  return useMemo(
    () => ({
      contracts,
      documents: documentsQuery.data ?? [],
    }),
    [contracts, documentsQuery.data],
  )
}
