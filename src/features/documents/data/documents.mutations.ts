import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"
import { useAuthSession } from "@/features/auth/data/auth.queries"
import { setAccountStateCache } from "@/services/app/app.cache"
import type { DocumentUploadPayload } from "@/services/app/app.types"

import { signContract, uploadDocument } from "./documents.service"

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, DocumentUploadPayload>({
    mutationFn: (payload: DocumentUploadPayload) => uploadDocument(accountId!, payload),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useSignContractMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, string>({
    mutationFn: (contractId: string) => Promise.resolve(signContract(accountId!, contractId)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useDocumentActions() {
  const uploadDocumentMutation = useUploadDocumentMutation()
  const signContractMutation = useSignContractMutation()

  return useMemo(
    () => ({
      signContract: (contractId: string) => signContractMutation.mutate(contractId),
      uploadDocument: (payload: DocumentUploadPayload) => uploadDocumentMutation.mutate(payload),
    }),
    [signContractMutation, uploadDocumentMutation],
  )
}
