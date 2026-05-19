import type { ReactNode } from "react"

import { DOCUMENTS_SECTION_CONTENT } from "./ProfileDetailDocumentsContent"
import { EMPLOYER_SECTION_CONTENT } from "./ProfileDetailEmployerContent"
import { SETTINGS_SECTION_CONTENT } from "./ProfileDetailSettingsContent"
import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

export const READONLY_SECTION_CONTENT: Partial<
  Record<
    SectionKey,
    {
      editable: boolean
      render: (screen: ProfileDetailScreenState) => ReactNode
    }
  >
> = {
  ...DOCUMENTS_SECTION_CONTENT,
  ...EMPLOYER_SECTION_CONTENT,
  ...SETTINGS_SECTION_CONTENT,
}
