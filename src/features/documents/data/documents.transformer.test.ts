import type { EmployeeDocumentDto } from "./documents.dto"
import { toDocumentItem } from "./documents.transformer"

const baseDto: EmployeeDocumentDto = {
  id: 42,
  name: "Payslip June 2026",
  fileName: "payslip-2026-06.pdf",
  fileExtension: "pdf",
  contentType: "application/pdf",
  fileSize: 12345,
  uploadDate: "2026-06-20T08:00:00Z",
  employeeDocumentTypeId: 1,
  employeeDocumentType: "Payslip",
}

describe("documents.transformer", () => {
  it("maps a stored document to an available DocumentItem", () => {
    const item = toDocumentItem(baseDto)
    expect(item.id).toBe("42")
    expect(item.title).toBe("Payslip June 2026")
    expect(item.subtitle).toBe("Payslip")
    expect(item.status).toBe("available")
    expect(item.uploadedFileName).toBe("payslip-2026-06.pdf")
    expect(item.uploadedFileSize).toBe(12345)
    expect(item.uploadedMimeType).toBe("application/pdf")
    expect(item.uploadedUri).toBeUndefined()
  })

  it("falls back to the file name when no document type is present", () => {
    expect(toDocumentItem({ ...baseDto, employeeDocumentType: null }).subtitle).toBe(
      "payslip-2026-06.pdf",
    )
  })

  it("buckets the document type into a display category", () => {
    expect(
      toDocumentItem({ ...baseDto, employeeDocumentType: "Employment contract" }).category,
    ).toBe("Contracts")
    expect(toDocumentItem({ ...baseDto, employeeDocumentType: "ID card" }).category).toBe(
      "Identity",
    )
    expect(toDocumentItem({ ...baseDto, employeeDocumentType: "Payslip" }).category).toBe("Payroll")
    expect(toDocumentItem({ ...baseDto, employeeDocumentType: "Mystery" }).category).toBe("Payroll")
  })
})
