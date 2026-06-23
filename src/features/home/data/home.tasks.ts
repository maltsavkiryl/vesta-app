import type { DocumentItem, HomeTask, PlanningWindow, Shift } from "@/core/models"

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
      title: "Upload your ID card",
      subtitle: "Required before the next payroll run",
      urgency: "high",
      actionLabel: "Upload",
      action: {
        type: "uploadDocument",
        documentId: "document-1",
        title: "ID card verification",
      },
    })
  }

  if (nextShiftToReview) {
    tasks.push({
      id: `task-review-${nextShiftToReview.id}`,
      title: `Review ${nextShiftToReview.dayLabel} shift update`,
      subtitle: nextShiftToReview.changeSummary ?? "Your manager needs a response on this shift",
      urgency: "medium",
      actionLabel: "Review",
      action: { type: "respondToShift", shiftId: nextShiftToReview.id },
    })
  }

  if (nextPlanningWindow) {
    tasks.push({
      id: `task-availability-${nextPlanningWindow.id}`,
      title: `Set availability for ${nextPlanningWindow.label.toLowerCase()}`,
      subtitle: "Help the team finalize rota planning",
      urgency: "low",
      actionLabel: "Set",
      action: { type: "editAvailabilityOverride", date: nextPlanningWindow.startDate },
    })
  }

  return tasks
}
