import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"
import type { DocumentUploadPayload } from "@/services/app/app.types"
import { persistLocalAsset } from "@/services/app/file-storage.service"

async function persistDocumentPayload(accountId: string, payload: DocumentUploadPayload) {
  const persistedUri = await persistLocalAsset({
    accountId,
    fileName: payload.fileName,
    kind: "documents",
    sourceUri: payload.uri,
  })

  return {
    ...payload,
    uri: persistedUri,
  }
}

export async function uploadDocument(accountId: string, payload: DocumentUploadPayload) {
  const nextPayload = await persistDocumentPayload(accountId, payload)
  return commitAccountAction(
    accountId,
    { type: "uploadDocument", payload: nextPayload },
    applyAppAction,
  )
}

export function signContract(accountId: string, contractId: string) {
  return commitAccountAction(
    accountId,
    { type: "signContract", payload: { contractId } },
    applyAppAction,
  )
}
