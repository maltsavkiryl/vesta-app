import { useCallback } from "react"
import { useRouter } from "expo-router"

import type { AppActionIntent } from "@/core/models"
import { useDocumentActions } from "@/features/documents/data/documents.mutations"
import { showDocumentUploadOptions } from "@/features/documents/documentUploadFlow"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  getActivePlanningWindow,
  getNextIncompleteAvailabilityDate,
} from "@/features/schedule/schedule.utils"
import { fireHaptic } from "@/utils/haptics"

type ActionResult = "completed" | "opened" | "cancelled" | "failed"

export function useAppAction() {
  const router = useRouter()
  const { state } = useScheduleStateQuery()
  const { uploadDocument } = useDocumentActions()
  const { respondToShift } = useScheduleActions()

  const runAction = useCallback(
    async (action?: AppActionIntent): Promise<ActionResult> => {
      if (!action) return "cancelled"

      switch (action.type) {
        case "navigate":
          fireHaptic("selection")
          router.push(action.route as never)
          return "opened"
        case "uploadDocument":
          return showDocumentUploadOptions({
            target: {
              id: action.documentId,
              title: action.title,
            },
            uploadDocument,
          })
        case "editAvailabilityTemplate":
          fireHaptic("selection")
          router.push("/(app)/availability-template" as never)
          return "opened"
        case "editAvailabilityOverride": {
          const planningWindow = state ? getActivePlanningWindow(state) : undefined
          const date =
            action.date ??
            (state
              ? getNextIncompleteAvailabilityDate(
                  planningWindow,
                  state.availabilityTemplate,
                  state.availabilityOverrides,
                )
              : undefined)

          if (!date) {
            fireHaptic("selection")
            router.push("/(app)/(tabs)/schedule" as never)
            return "opened"
          }

          fireHaptic("selection")
          router.push(`/(app)/availability/${date}` as never)
          return "opened"
        }
        case "createScheduleRequest":
          fireHaptic("selection")
          router.push(
            `/(app)/request?category=${action.category ?? ""}&shiftId=${action.shiftId ?? ""}` as never,
          )
          return "opened"
        case "respondToShift": {
          const result = await respondToShift(action.shiftId)
          if (!result.ok) {
            fireHaptic("error")
            return "failed"
          }

          fireHaptic("success")
          router.push(`/(app)/shift/${action.shiftId}` as never)
          return "completed"
        }
      }
    },
    [respondToShift, router, state, uploadDocument],
  )

  return { runAction }
}
