import { persistLocalAsset } from "@/services/app/file-storage.service"
import type { Result } from "@/shared/result"

import type { DocumentUploadError } from "./documents.errors"
import type { DocumentsRepository, DocumentUploadInput } from "./documents.repository"

export async function uploadDocumentWorkflow(
  repository: DocumentsRepository,
  accountId: string,
  input: DocumentUploadInput,
): Promise<
  Result<Awaited<ReturnType<DocumentsRepository["getDocuments"]>>[number], DocumentUploadError>
> {
  if (!input.title.trim() || !input.fileName.trim() || !input.uri.trim()) {
    return {
      ok: false,
      error: {
        type: "validation",
        message: "Choose a file before uploading the document.",
      },
    }
  }

  const persistedUri = await persistLocalAsset({
    accountId,
    fileName: input.fileName,
    kind: "documents",
    sourceUri: input.uri,
  })

  return repository.uploadDocument(accountId, {
    ...input,
    uri: persistedUri,
  })
}
