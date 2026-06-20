/**
 * Hand-written DTO interfaces matching the Vesta Workforce API.
 * Source: GET /api/v1/employee/documents (EmployeeDocumentDto + PagedResultDto)
 * and GET /api/v1/employee/documents/{id}/url (FileDownloadUrlDto).
 * These types MUST NOT leak into screens — transform via documents.transformer.ts.
 */

export interface EmployeeDocumentDto {
  id: number
  name: string
  fileName: string
  fileExtension: string
  contentType: string
  fileSize: number
  uploadDate: string
  employeeDocumentTypeId: number
  employeeDocumentType?: string | null
  comment?: string | null
}

export interface PagedDocumentsDto {
  items: EmployeeDocumentDto[]
  offset: number
  limit: number
  totalCount: number
}

export interface FileDownloadUrlDto {
  url: string
  expiresAt: string
}
