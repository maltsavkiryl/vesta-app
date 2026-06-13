import type { AppActionIntent, AppNavigationRoute } from "@/core/models"
import type { TxKeyPath } from "@/i18n"

function getNavigationLabelKey(route: AppNavigationRoute): TxKeyPath {
  if (route === "/notifications") return "notifications:actions.viewUpdate"
  if (route === "/(app)/(tabs)/schedule") return "notifications:actions.reviewPlanning"
  if (route === "/(app)/(tabs)/time") return "notifications:actions.reviewTime"
  if (route === "/(app)/(tabs)/profile") return "notifications:actions.reviewProfile"
  if (route === "/profile/legal-documents") return "notifications:actions.reviewDocuments"
  if (route === "/profile/contracts") return "notifications:actions.reviewContracts"
  if (route === "/profile/payslips") return "notifications:actions.reviewPayslips"
  if (route === "/(app)/tasks") return "notifications:actions.viewTasks"
  if (route === "/(app)/request") return "notifications:actions.reviewRequest"
  if (route.startsWith("/(app)/shift/")) return "notifications:actions.viewShift"
  if (route.startsWith("/(app)/availability/")) return "notifications:actions.setHours"
  if (route.startsWith("/(app)/document-upload/")) return "notifications:actions.uploadNow"
  if (route.startsWith("/(app)/document-contract/")) return "notifications:actions.reviewContract"
  if (route.startsWith("/(app)/document-payslip/")) return "notifications:actions.reviewPayslip"

  return "notifications:actions.open"
}

/**
 * Returns the i18n key for a notification's call-to-action label, or null when
 * there is no action. Consumers resolve the key via `translate`/`<Text tx>`.
 */
export function getNotificationActionLabelKey(action?: AppActionIntent): TxKeyPath | null {
  if (!action) return null

  switch (action.type) {
    case "navigate":
      return getNavigationLabelKey(action.route)
    case "uploadDocument":
      return "notifications:actions.uploadNow"
    case "editAvailabilityTemplate":
      return "notifications:actions.editTemplate"
    case "editAvailabilityOverride":
      return "notifications:actions.setHours"
    case "createScheduleRequest":
      return "notifications:actions.reviewRequest"
    case "respondToShift":
      return "notifications:actions.reviewShift"
  }
}
