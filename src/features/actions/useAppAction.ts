import { useCallback } from "react"
import { useRouter } from "expo-router"

import type { AppActionIntent, AvailabilityDay } from "@/core/models"
import { showDocumentUploadOptions } from "@/features/documents/documentUploadFlow"
import { useAppSession } from "@/providers/app-provider"

type ActionResult = "completed" | "opened" | "cancelled" | "failed"

function getFirstAvailabilityDate(availability: Record<string, AvailabilityDay>) {
  return Object.values(availability)
    .map((day) => day.date)
    .sort((left, right) => left.localeCompare(right))[0]
}

export function useAppAction() {
  const router = useRouter()
  const { state, uploadDocument } = useAppSession()

  const runAction = useCallback(
    async (action?: AppActionIntent): Promise<ActionResult> => {
      if (!action) return "cancelled"

      switch (action.type) {
        case "navigate":
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
        case "editAvailability": {
          const date = action.date ?? getFirstAvailabilityDate(state.availability)
          if (!date) {
            router.push("/(app)/(tabs)/schedule" as never)
            return "opened"
          }
          router.push(`/(app)/availability/${date}` as never)
          return "opened"
        }
      }
    },
    [router, state.availability, uploadDocument],
  )

  return { runAction }
}
