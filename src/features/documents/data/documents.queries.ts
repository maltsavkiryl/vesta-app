import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const documentsQueryKeys = {
  contracts: (accountId: string | null) => ["documents", accountId, "contracts"] as const,
  documents: (accountId: string | null) => ["documents", accountId, "list"] as const,
}

export function useDocumentsQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.documents.getDocuments(accountId!),
    queryKey: documentsQueryKeys.documents(accountId),
  })

  return {
    data: query.data,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useContractsQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.documents.getContracts(accountId!),
    queryKey: documentsQueryKeys.contracts(accountId),
  })

  return {
    data: query.data,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useDocumentsStateQuery() {
  const documentsQuery = useDocumentsQuery()
  const contractsQuery = useContractsQuery()

  const refetch = useCallback(() => {
    void documentsQuery.refetch()
    void contractsQuery.refetch()
  }, [contractsQuery, documentsQuery])

  return useMemo(
    () => ({
      contracts: contractsQuery.data ?? [],
      documents: documentsQuery.data ?? [],
      isError: documentsQuery.isError || contractsQuery.isError,
      isLoading: documentsQuery.isLoading || contractsQuery.isLoading,
      refetch,
    }),
    [
      contractsQuery.data,
      contractsQuery.isError,
      contractsQuery.isLoading,
      documentsQuery.data,
      documentsQuery.isError,
      documentsQuery.isLoading,
      refetch,
    ],
  )
}
