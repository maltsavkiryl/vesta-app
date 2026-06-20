import { formatLocalizedDate } from "@/core/format"
import type { DocumentItem } from "@/core/models"

import type { EmployeeDocumentDto } from "./documents.dto"

// Buckets the backend document type onto one of the three UI categories used for
// grouping. The category is purely a display label; unknown types fall to Payroll
// (payslips are by far the most common employee document).
function resolveCategory(typeLabel: string | null | undefined): DocumentItem["category"] {
  const value = (typeLabel ?? "").toLowerCase()
  if (/contract|overeenkomst|arbeid/.test(value)) return "Contracts"
  if (/identi|id.?card|paspoort|passport|rijbewijs/.test(value)) return "Identity"
  return "Payroll"
}

/**
 * Maps a stored employee document onto the inbox row model. Backend documents are
 * always completed files the employee can open, so they map to "available". The
 * binary itself is fetched lazily via getDocumentDownloadUrl, so uploadedUri is
 * left unset here.
 */
export function toDocumentItem(dto: EmployeeDocumentDto): DocumentItem {
  return {
    id: String(dto.id),
    title: dto.name,
    subtitle: dto.employeeDocumentType ?? dto.fileName,
    category: resolveCategory(dto.employeeDocumentType),
    status: "available",
    ctaLabel: "View",
    uploadedAt: formatLocalizedDate(dto.uploadDate, "full"),
    uploadedFileName: dto.fileName,
    uploadedFileSize: dto.fileSize,
    uploadedMimeType: dto.contentType,
  }
}
