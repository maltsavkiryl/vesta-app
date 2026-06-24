import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import type { DesignTokens } from "@/ui"

import type { DisplayDocumentStatus, DocumentStatusConfig } from "./documents.types"

export function getDocumentStatusConfig(
  tokens: DesignTokens,
  status: DisplayDocumentStatus,
): DocumentStatusConfig & { icon: keyof typeof Ionicons.glyphMap } {
  const normalized = status === "action_required" ? "missing" : status
  const statusMap = {
    available: {
      backgroundColor: `${tokens.accent}14`,
      color: tokens.accent,
      icon: "document-text-outline",
      label: translate("documents:statusAvailable"),
    },
    missing: {
      backgroundColor: `${tokens.danger}14`,
      color: tokens.danger,
      icon: "alert-circle-outline",
      label: translate("documents:statusMissing"),
    },
    pending: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: translate("documents:statusPending"),
    },
    processing: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: translate("documents:underReview"),
    },
    signed: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: translate("documents:statusSigned"),
    },
    verified: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: translate("documents:statusApproved"),
    },
  } satisfies Record<
    "available" | "missing" | "pending" | "processing" | "signed" | "verified",
    DocumentStatusConfig & { icon: keyof typeof Ionicons.glyphMap }
  >

  return statusMap[normalized]
}

export function shouldShowDocumentRowStatus(status: DisplayDocumentStatus) {
  return status === "processing"
}
