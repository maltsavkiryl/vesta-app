import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const documentsQueryKeys = {
  contracts: (accountId: string | null) => ["documents", accountId, "contracts"] as const,
  documents: (accountId: string | null) => ["documents", accountId, "list"] as const,
}

export function useDocumentsQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.documents.getDocuments(accountId!),
    queryKey: documentsQueryKeys.documents(accountId),
  })
}

export function useContractsQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.documents.getContracts(accountId!),
    queryKey: documentsQueryKeys.contracts(accountId),
  })
  return query.data ?? []
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
