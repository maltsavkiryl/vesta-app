import type { DocumentItem } from "@/core/models"

import { isRequiredDocument } from "./documents.utils"

function buildDocument(status: DocumentItem["status"]): DocumentItem {
  return {
    category: "Identity",
    ctaLabel: "Open",
    id: `document-${status}`,
    status,
    subtitle: "Subtitle",
    title: "Title",
  }
}

describe("isRequiredDocument", () => {
  it("keeps missing and processing documents in the required tab", () => {
    expect(isRequiredDocument(buildDocument("action_required"))).toBe(true)
    expect(isRequiredDocument(buildDocument("processing"))).toBe(true)
  })

  it("excludes view-only document statuses from the required tab", () => {
    expect(isRequiredDocument(buildDocument("available"))).toBe(false)
    expect(isRequiredDocument(buildDocument("verified"))).toBe(false)
  })
})
