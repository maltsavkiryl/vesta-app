import type { DocumentItem } from "@/core/models"
import type { Result } from "@/shared/result"

import type { DocumentUploadError } from "./documents.errors"

export interface DocumentUploadInput {
  documentId?: string
  fileName: string
  fileSize?: number
  mimeType?: string
  title: string
  uri: string
}

export interface DocumentContract {
  body: string
  date: string
  id: string
  name: string
  status: "signed" | "pending"
  type: string
}

export interface DocumentsRepository {
  getContracts(accountId: string): Promise<DocumentContract[]>
  getDocuments(accountId: string): Promise<DocumentItem[]>
  /** Resolves a directly-openable URL for a document, or null when unavailable. */
  getDocumentDownloadUrl(accountId: string, documentId: string): Promise<string | null>
  signContract(
    accountId: string,
    contractId: string,
  ): Promise<Result<DocumentContract, DocumentUploadError>>
  uploadDocument(
    accountId: string,
    input: DocumentUploadInput,
  ): Promise<Result<DocumentItem, DocumentUploadError>>
}
