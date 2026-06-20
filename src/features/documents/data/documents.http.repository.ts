/**
 * HTTP implementation of DocumentsRepository against the employee documents API.
 *
 *  - GET /employee/documents?offset&limit   → paged list of stored documents
 *  - GET /employee/documents/{id}/url        → short-lived direct-download URL
 *
 * Contracts, upload and signing are not yet backed by the employee API, so they
 * delegate to the provided fallback (the mock repository) until the contract
 * endpoints land. Reads throw on infrastructure failure, per repo convention.
 */
import type { DocumentItem } from "@/core/models"
import type { DocumentsRepository } from "@/features/documents/data/documents.repository"
import type { HttpClient } from "@/services/api/httpClient"

import type { FileDownloadUrlDto, PagedDocumentsDto } from "./documents.dto"
import { toDocumentItem } from "./documents.transformer"

const PAGE_LIMIT = 100

export function createDocumentsHttpRepository(
  http: HttpClient,
  fallback: DocumentsRepository,
): DocumentsRepository {
  return {
    async getDocuments(): Promise<DocumentItem[]> {
      const res = await http.get<PagedDocumentsDto>("/employee/documents", {
        offset: 0,
        limit: PAGE_LIMIT,
      })
      if (!res.ok || !res.data) throw new Error("Failed to load documents")
      return res.data.items.map(toDocumentItem)
    },
    async getDocumentDownloadUrl(_accountId, documentId) {
      const res = await http.get<FileDownloadUrlDto>(`/employee/documents/${documentId}/url`)
      return res.ok && res.data ? res.data.url : null
    },
    // Not yet exposed by the employee API — delegated until the contract slice.
    getContracts: fallback.getContracts,
    uploadDocument: fallback.uploadDocument,
    signContract: fallback.signContract,
  }
}
