import type { DocumentItem, HomeTask, PlanningWindow, Shift } from "@/core/models"
import { translate } from "@/i18n/translate"

export interface HomeTasksInput {
  documents: DocumentItem[]
  planningWindows: PlanningWindow[]
  shifts: Shift[]
}

/**
 * Derives the home-screen action list from the employee's current documents,
 * shifts, and planning windows. Pure and source-agnostic so the same logic
 * backs both the mock repository and the HTTP repository (which composes the
 * real schedule/documents endpoints) — keeping the two in lockstep.
 */
export function deriveHomeTasks({
  documents,
  planningWindows,
  shifts,
}: HomeTasksInput): HomeTask[] {
  const tasks: HomeTask[] = []
  const nextShiftToReview = shifts.find((shift) => shift.requiresResponse)
  const nextPlanningWindow = planningWindows.find((window) => window.status === "open")

  if (documents.some((document) => document.status === "action_required")) {
    tasks.push({
      id: "task-upload-id-card",
      title: translate("home:derivedTasks.uploadIdTitle"),
      subtitle: translate("home:derivedTasks.uploadIdSubtitle"),
      urgency: "high",
      actionLabel: translate("home:derivedTasks.upload"),
      action: {
        type: "uploadDocument",
        documentId: "document-1",
        title: translate("home:derivedTasks.uploadIdActionTitle"),
      },
    })
  }

  if (nextShiftToReview) {
    tasks.push({
      id: `task-review-${nextShiftToReview.id}`,
      title: translate("home:derivedTasks.reviewShiftTitle", { day: nextShiftToReview.dayLabel }),
      subtitle:
        nextShiftToReview.changeSummary ?? translate("home:derivedTasks.reviewShiftSubtitle"),
      urgency: "medium",
      actionLabel: translate("home:derivedTasks.review"),
      action: { type: "respondToShift", shiftId: nextShiftToReview.id },
    })
  }

  if (nextPlanningWindow) {
    tasks.push({
      id: `task-availability-${nextPlanningWindow.id}`,
      title: translate("home:derivedTasks.setAvailabilityTitle", {
        window: nextPlanningWindow.label.toLowerCase(),
      }),
      subtitle: translate("home:derivedTasks.setAvailabilitySubtitle"),
      urgency: "low",
      actionLabel: translate("home:derivedTasks.set"),
      action: { type: "editAvailabilityOverride", date: nextPlanningWindow.startDate },
    })
  }

  return tasks
}
