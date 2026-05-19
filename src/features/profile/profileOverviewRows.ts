import type { ReactNode } from "react"
import { Ionicons } from "@expo/vector-icons"

import type { AppStoreState } from "@/core/models"
import { maskIban } from "@/utils/formatters"

import {
  PROFILE_OVERVIEW_TITLES,
  type ProfileOverviewSection,
  type ProfileRoute,
} from "./profileSections"

export interface ProfileOverviewRow {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value?: string
  badge?: string
  route?: ProfileRoute
  destructive?: boolean
  showChevron?: boolean
  onPress?: () => void
  rightAccessory?: ReactNode
}

export function buildProfileOverviewSections({
  contractSummary,
  fullName,
  legalDocumentsSummary,
  payslipsSummary,
  notificationCount,
  state,
  themeContext,
}: {
  contractSummary: string
  fullName: string
  legalDocumentsSummary: string
  payslipsSummary: string
  notificationCount: number
  state: AppStoreState
  themeContext: "light" | "dark"
}) {
  return {
    employment: [
      {
        icon: "business-outline",
        label: `${state.employers.length} employer${state.employers.length === 1 ? "" : "s"}`,
        route: "/profile/employers",
        value: state.employers.map((employer) => employer.name).join(", ") || "None",
      },
      {
        icon: "shield-checkmark-outline",
        label: "Legal documents",
        route: "/profile/legal-documents",
        value: legalDocumentsSummary,
      },
      {
        icon: "document-text-outline",
        label: "Contracts",
        route: "/profile/contracts",
        value: contractSummary,
      },
      {
        icon: "cash-outline",
        label: "Payslips",
        route: "/profile/payslips",
        value: payslipsSummary,
      },
    ],
    personal: [
      {
        icon: "person-outline",
        label: "Personal details",
        route: "/profile/personal",
        value: fullName,
      },
      {
        icon: "mail-outline",
        label: "Contact details",
        route: "/profile/contact",
        value: state.profile.email,
      },
      {
        icon: "location-outline",
        label: "Address",
        route: "/profile/address",
        value: `${state.profile.address.city || state.profile.homeCity}, ${state.profile.address.country}`,
      },
      {
        icon: "card-outline",
        label: "Bank details",
        route: "/profile/banking",
        value: maskIban(state.profile.bankAccount.iban),
      },
      {
        icon: "document-text-outline",
        label: "Legal information",
        route: "/profile/legal",
        value: "National reg. · Tax ID",
      },
    ],
    settings: [
      {
        icon: themeContext === "dark" ? "moon-outline" : "sunny-outline",
        label: "Appearance",
        route: "/profile/appearance",
        value: themeContext === "dark" ? "Dark" : "Light",
      },
      {
        icon: "notifications-outline",
        label: "Notifications",
        route: "/profile/preferences",
        value: `${notificationCount} enabled`,
      },
      {
        icon: "globe-outline",
        label: "Language",
        route: "/profile/language",
        value: state.profile.language,
      },
      {
        icon: "shield-checkmark-outline",
        label: "Security",
        route: "/profile/security",
        value: `Password, ${state.profile.security.biometricType}`,
      },
      {
        icon: "lock-closed-outline",
        label: "Privacy",
        route: "/profile/privacy",
        value: "Data & permissions",
      },
    ],
    support: [
      {
        icon: "help-circle-outline",
        label: "Help & support",
        route: "/profile/support",
        value: "FAQs, contact Vesta",
      },
    ],
  } satisfies Record<ProfileOverviewSection, ProfileOverviewRow[]>
}

export const PROFILE_OVERVIEW_ORDER = Object.keys(
  PROFILE_OVERVIEW_TITLES,
) as ProfileOverviewSection[]
