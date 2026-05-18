import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"
import type { ClockActionPayload } from "@/services/app/app.types"
import { persistLocalAsset } from "@/services/app/file-storage.service"

async function persistClockPayloadProofPhoto(
  accountId: string,
  payload?: ClockActionPayload,
): Promise<ClockActionPayload | undefined> {
  if (!payload?.proofPhoto) return payload

  const persistedUri = await persistLocalAsset({
    accountId,
    fileName: payload.proofPhoto.fileName ?? "clock-in-proof.jpg",
    kind: "proof-photos",
    sourceUri: payload.proofPhoto.uri,
  })

  return {
    ...payload,
    proofPhoto: {
      ...payload.proofPhoto,
      uri: persistedUri,
    },
  }
}

export async function startClock(accountId: string, payload?: ClockActionPayload) {
  const nextPayload = await persistClockPayloadProofPhoto(accountId, payload)
  return commitAccountAction(
    accountId,
    { type: "startClock", payload: nextPayload },
    applyAppAction,
  )
}

export function startBreak(accountId: string, payload?: ClockActionPayload) {
  return commitAccountAction(accountId, { type: "startBreak", payload }, applyAppAction)
}

export function endBreak(accountId: string, payload?: ClockActionPayload) {
  return commitAccountAction(accountId, { type: "endBreak", payload }, applyAppAction)
}

export function confirmClockOut(accountId: string, payload?: ClockActionPayload) {
  return commitAccountAction(accountId, { type: "confirmClockOut", payload }, applyAppAction)
}
