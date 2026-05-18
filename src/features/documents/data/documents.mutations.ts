import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

import { documentsQueryKeys } from "./documents.queries"
import { uploadDocumentWorkflow } from "./documents.workflow"

function invalidateDocumentsQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
) {
  void queryClient.invalidateQueries({ queryKey: documentsQueryKeys.documents(accountId) })
  void queryClient.invalidateQueries({ queryKey: documentsQueryKeys.contracts(accountId) })
  void queryClient.invalidateQueries({ queryKey: ["home", accountId] })
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof uploadDocumentWorkflow>[2]) =>
      uploadDocumentWorkflow(appRepositories.documents, accountId!, payload),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateDocumentsQueries(queryClient, accountId)
    },
  })
}

export function useSignContractMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (contractId: string) =>
      appRepositories.documents.signContract(accountId!, contractId),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      invalidateDocumentsQueries(queryClient, accountId)
    },
  })
}

export function useDocumentActions() {
  const uploadDocumentMutation = useUploadDocumentMutation()
  const signContractMutation = useSignContractMutation()

  return useMemo(
    () => ({
      signContract: (contractId: string) => signContractMutation.mutateAsync(contractId),
      uploadDocument: (payload: Parameters<typeof uploadDocumentWorkflow>[2]) =>
        uploadDocumentMutation.mutateAsync(payload),
    }),
    [signContractMutation, uploadDocumentMutation],
  )
}
