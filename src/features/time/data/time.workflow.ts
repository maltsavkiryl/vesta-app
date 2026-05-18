import { persistLocalAsset } from "@/services/app/file-storage.service"
import type { Result } from "@/shared/result"

import type { ClockError } from "./time.errors"
import type { ClockCommandInput, TimeRepository } from "./time.repository"

async function persistProofPhoto(
  accountId: string,
  input?: ClockCommandInput,
): Promise<ClockCommandInput | undefined> {
  if (!input?.proofPhoto?.uri || !input.proofPhoto.fileName) {
    return input
  }

  const persistedUri = await persistLocalAsset({
    accountId,
    fileName: input.proofPhoto.fileName,
    kind: "proof-photos",
    sourceUri: input.proofPhoto.uri,
  })

  return {
    ...input,
    proofPhoto: {
      ...input.proofPhoto,
      uri: persistedUri,
    },
  }
}

export async function clockInWorkflow(
  repository: TimeRepository,
  accountId: string,
  input?: ClockCommandInput,
): Promise<Result<Awaited<ReturnType<TimeRepository["getClockSession"]>>, ClockError>> {
  return repository.clockIn(accountId, await persistProofPhoto(accountId, input))
}

export function clockOutWorkflow(
  repository: TimeRepository,
  accountId: string,
  input?: ClockCommandInput,
) {
  return repository.clockOut(accountId, input)
}
