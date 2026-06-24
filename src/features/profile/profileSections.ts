import { Ionicons } from "@expo/vector-icons"

import type { AppLocale, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"

export type ProfileOverviewSection = "personal" | "employment" | "settings" | "support"
export type ProfileRoute =
  | "/profile/personal"
  | "/profile/contact"
  | "/profile/address"
  | "/profile/appearance"
  | "/profile/preferences"
  | "/profile/language"
  | "/profile/legal-documents"
  | "/profile/contracts"
  | "/profile/payslips"
  | "/profile/employers"
  | "/profile/banking"
  | "/profile/legal"
  | "/profile/security"
  | "/profile/change-password"
  | "/profile/privacy"
  | "/profile/support"

export type SectionKey =
  | "personal"
  | "contact"
  | "address"
  | "appearance"
  | "preferences"
  | "language"
  | "legal-documents"
  | "contracts"
  | "payslips"
  | "employers"
  | "join-employer"
  | "banking"
  | "legal"
  | "security"
  | "change-password"
  | "privacy"
  | "support"

export type JoinMode = "code" | "search"

export interface LanguageOption {
  label: string
  value: AppLocale
}

// Language labels are endonyms (the language's own name) — intentionally not translated.
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { label: "Nederlands", value: "nl" },
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
]

// Overview-section titles, keyed for i18n. Values are translation keys; resolve
// with `getProfileOverviewTitles()` / `translate()` so locale is read at render.
export const PROFILE_OVERVIEW_TITLE_KEYS: Record<ProfileOverviewSection, TxKeyPath> = {
  employment: "profile:overviewTitles.employment",
  personal: "profile:overviewTitles.personal",
  settings: "profile:overviewTitles.settings",
  support: "profile:overviewTitles.support",
}

export function getProfileOverviewTitles(): Record<ProfileOverviewSection, string> {
  return {
    employment: translate(PROFILE_OVERVIEW_TITLE_KEYS.employment),
    personal: translate(PROFILE_OVERVIEW_TITLE_KEYS.personal),
    settings: translate(PROFILE_OVERVIEW_TITLE_KEYS.settings),
    support: translate(PROFILE_OVERVIEW_TITLE_KEYS.support),
  }
}

interface ProfileSectionMeta {
  icon: keyof typeof Ionicons.glyphMap
  titleKey: TxKeyPath
  subtitleKey?: TxKeyPath
}

export const PROFILE_SECTION_META: Record<SectionKey, ProfileSectionMeta> = {
  "address": {
    icon: "location-outline",
    subtitleKey: "profile:sectionMeta.addressSubtitle",
    titleKey: "profile:sectionMeta.addressTitle",
  },
  "appearance": {
    icon: "color-palette-outline",
    subtitleKey: "profile:sectionMeta.appearanceSubtitle",
    titleKey: "profile:sectionMeta.appearanceTitle",
  },
  "banking": {
    icon: "card-outline",
    subtitleKey: "profile:sectionMeta.bankingSubtitle",
    titleKey: "profile:sectionMeta.bankingTitle",
  },
  "contact": {
    icon: "call-outline",
    subtitleKey: "profile:sectionMeta.contactSubtitle",
    titleKey: "profile:sectionMeta.contactTitle",
  },
  "contracts": {
    icon: "document-text-outline",
    titleKey: "profile:sectionMeta.contractsTitle",
  },
  "employers": {
    icon: "briefcase-outline",
    subtitleKey: "profile:sectionMeta.employersSubtitle",
    titleKey: "profile:sectionMeta.employersTitle",
  },
  "legal-documents": {
    icon: "shield-checkmark-outline",
    titleKey: "profile:sectionMeta.legalDocumentsTitle",
  },
  "join-employer": {
    icon: "add-circle-outline",
    titleKey: "profile:sectionMeta.joinEmployerTitle",
  },
  "language": {
    icon: "globe-outline",
    subtitleKey: "profile:sectionMeta.languageSubtitle",
    titleKey: "profile:sectionMeta.languageTitle",
  },
  "legal": {
    icon: "shield-checkmark-outline",
    subtitleKey: "profile:sectionMeta.legalSubtitle",
    titleKey: "profile:sectionMeta.legalTitle",
  },
  "personal": {
    icon: "person-outline",
    subtitleKey: "profile:sectionMeta.personalSubtitle",
    titleKey: "profile:sectionMeta.personalTitle",
  },
  "payslips": {
    icon: "cash-outline",
    titleKey: "profile:sectionMeta.payslipsTitle",
  },
  "preferences": {
    icon: "notifications-outline",
    subtitleKey: "profile:sectionMeta.preferencesSubtitle",
    titleKey: "profile:sectionMeta.preferencesTitle",
  },
  "privacy": {
    icon: "lock-closed-outline",
    subtitleKey: "profile:sectionMeta.privacySubtitle",
    titleKey: "profile:sectionMeta.privacyTitle",
  },
  "security": {
    icon: "shield-checkmark-outline",
    subtitleKey: "profile:sectionMeta.securitySubtitle",
    titleKey: "profile:sectionMeta.securityTitle",
  },
  "change-password": {
    icon: "key-outline",
    subtitleKey: "profile:sectionMeta.changePasswordSubtitle",
    titleKey: "profile:sectionMeta.changePasswordTitle",
  },
  "support": {
    icon: "help-circle-outline",
    subtitleKey: "profile:sectionMeta.supportSubtitle",
    titleKey: "profile:sectionMeta.supportTitle",
  },
}

/** Resolves a section's translated icon/title/subtitle at call time. */
export function getProfileSectionMeta(section: SectionKey): {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
} {
  const meta = PROFILE_SECTION_META[section]
  return {
    icon: meta.icon,
    title: translate(meta.titleKey),
    subtitle: meta.subtitleKey ? translate(meta.subtitleKey) : undefined,
  }
}

const EDITABLE_PROFILE_SECTIONS: SectionKey[] = [
  "personal",
  "contact",
  "address",
  "banking",
  "legal",
]

export function getProfileSection(value?: string): SectionKey {
  return value && value in PROFILE_SECTION_META ? (value as SectionKey) : "personal"
}

export function isEditableProfileSection(section: SectionKey) {
  return EDITABLE_PROFILE_SECTIONS.includes(section)
}
