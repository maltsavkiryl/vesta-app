import { useCallback } from "react"

import { appRepositories } from "@/composition/repositories"
import type { DocumentItem } from "@/core/models"
import { useAppSession } from "@/providers/app-provider"

import { openDocumentFile } from "./documentShare"

/** Opens a document — shares a local file or opens a server document's URL. */
export function useOpenDocument() {
  const { accountId } = useAppSession()
  return useCallback(
    (document: DocumentItem) => openDocumentFile(appRepositories.documents, accountId!, document),
    [accountId],
  )
}
