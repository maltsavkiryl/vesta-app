import type { ReactNode } from "react"

import { EDITABLE_SECTION_CONTENT } from "./ProfileDetailEditableContent"
import { READONLY_SECTION_CONTENT } from "./ProfileDetailReadonlyContent"
import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

const DETAIL_SECTION_REGISTRY: Record<
  SectionKey,
  {
    editable: boolean
    render: (screen: ProfileDetailScreenState) => ReactNode
  }
> = {
  ...READONLY_SECTION_CONTENT,
  ...EDITABLE_SECTION_CONTENT,
} as Record<
  SectionKey,
  {
    editable: boolean
    render: (screen: ProfileDetailScreenState) => ReactNode
  }
>

export function isDetailSectionEditable(section: SectionKey) {
  return DETAIL_SECTION_REGISTRY[section].editable
}

export function renderProfileDetailSection(section: SectionKey, screen: ProfileDetailScreenState) {
  return DETAIL_SECTION_REGISTRY[section].render(screen)
}
