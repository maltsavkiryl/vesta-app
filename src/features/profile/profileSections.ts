import { Ionicons } from "@expo/vector-icons"

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

export const LANGUAGE_OPTIONS = ["English (UK)", "Nederlands", "Français"] as const

export const PROFILE_OVERVIEW_TITLES: Record<ProfileOverviewSection, string> = {
  employment: "Employment",
  personal: "Personal",
  settings: "Settings",
  support: "Support",
}

export const PROFILE_SECTION_META: Record<
  SectionKey,
  {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    subtitle?: string
  }
> = {
  "address": {
    icon: "location-outline",
    subtitle: "The address used for official employment and payroll correspondence.",
    title: "Address",
  },
  "appearance": {
    icon: "color-palette-outline",
    subtitle: "Choose how Vesta should appear on this device.",
    title: "Appearance",
  },
  "banking": {
    icon: "card-outline",
    subtitle: "Payroll account and reimbursement details.",
    title: "Bank details",
  },
  "contact": {
    icon: "call-outline",
    subtitle: "How employers can reach you for urgent shift and payroll updates.",
    title: "Contact details",
  },
  "contracts": {
    icon: "document-text-outline",
    title: "Contracts",
  },
  "employers": {
    icon: "briefcase-outline",
    subtitle: "Restaurants and workplaces linked to your Vesta profile.",
    title: "Employers",
  },
  "legal-documents": {
    icon: "shield-checkmark-outline",
    title: "Legal documents",
  },
  "join-employer": {
    icon: "add-circle-outline",
    title: "Join employer",
  },
  "language": {
    icon: "globe-outline",
    subtitle: "Choose the language used throughout the app.",
    title: "Language",
  },
  "legal": {
    icon: "shield-checkmark-outline",
    subtitle: "Private identity details required for compliant employment.",
    title: "Legal information",
  },
  "personal": {
    icon: "person-outline",
    subtitle: "Names, profile basics, and employee identity.",
    title: "Personal details",
  },
  "payslips": {
    icon: "cash-outline",
    title: "Payslips",
  },
  "preferences": {
    icon: "notifications-outline",
    subtitle: "Choose how Vesta should notify you.",
    title: "Notifications",
  },
  "privacy": {
    icon: "lock-closed-outline",
    subtitle: "Control app analytics, diagnostics, and employer data sharing.",
    title: "Privacy",
  },
  "security": {
    icon: "shield-checkmark-outline",
    subtitle: "Manage your password and device unlock settings.",
    title: "Security",
  },
  "change-password": {
    icon: "key-outline",
    subtitle: "Update the local password for this device's demo account.",
    title: "Change password",
  },
  "support": {
    icon: "help-circle-outline",
    subtitle: "Find answers or contact Vesta support.",
    title: "Help & support",
  },
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
