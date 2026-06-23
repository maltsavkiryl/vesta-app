import type { DesignTokens } from "@/ui"

import { getDocumentStatusConfig, shouldShowDocumentRowStatus } from "./documents.status"

const tokens = {
  accent: "#1111ff",
  danger: "#ff0000",
  warning: "#ffaa00",
  success: "#00aa00",
} as unknown as DesignTokens

describe("getDocumentStatusConfig", () => {
  it("normalizes action_required to the missing/danger config", () => {
    const config = getDocumentStatusConfig(tokens, "action_required")
    expect(config.label).toBe("Missing")
    expect(config.color).toBe(tokens.danger)
    expect(config.icon).toBe("alert-circle-outline")
  })

  it("maps each display status to a label, colour and icon", () => {
    expect(getDocumentStatusConfig(tokens, "available").label).toBe("Available")
    expect(getDocumentStatusConfig(tokens, "pending").color).toBe(tokens.warning)
    expect(getDocumentStatusConfig(tokens, "processing").label).toBe("Under review")
    expect(getDocumentStatusConfig(tokens, "signed").color).toBe(tokens.success)
    expect(getDocumentStatusConfig(tokens, "verified").label).toBe("Approved")
  })
})

describe("shouldShowDocumentRowStatus", () => {
  it("only surfaces inline status text while processing", () => {
    expect(shouldShowDocumentRowStatus("processing")).toBe(true)
    expect(shouldShowDocumentRowStatus("available")).toBe(false)
    expect(shouldShowDocumentRowStatus("action_required")).toBe(false)
  })
})
