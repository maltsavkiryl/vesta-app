import type { AppActionIntent, AppNavigationRoute } from "@/core/models"

function getNavigationLabel(route: AppNavigationRoute) {
  if (route === "/notifications") return "View update"
  if (route === "/(app)/(tabs)/schedule") return "Review planning"
  if (route === "/(app)/(tabs)/time") return "Review time"
  if (route === "/(app)/(tabs)/profile") return "Review profile"
  if (route === "/profile/legal-documents") return "Review documents"
  if (route === "/profile/contracts") return "Review contracts"
  if (route === "/profile/payslips") return "Review payslips"
  if (route === "/(app)/tasks") return "View tasks"
  if (route === "/(app)/request") return "Review request"
  if (route.startsWith("/(app)/shift/")) return "View shift"
  if (route.startsWith("/(app)/availability/")) return "Set hours"
  if (route.startsWith("/(app)/document-upload/")) return "Upload now"
  if (route.startsWith("/(app)/document-contract/")) return "Review contract"
  if (route.startsWith("/(app)/document-payslip/")) return "Review payslip"

  return "Open"
}

export function getNotificationActionLabel(action?: AppActionIntent) {
  if (!action) return null

  switch (action.type) {
    case "navigate":
      return getNavigationLabel(action.route)
    case "uploadDocument":
      return "Upload now"
    case "editAvailabilityTemplate":
      return "Edit template"
    case "editAvailabilityOverride":
      return "Set hours"
    case "createScheduleRequest":
      return "Review request"
    case "respondToShift":
      return "Review shift"
  }
}
