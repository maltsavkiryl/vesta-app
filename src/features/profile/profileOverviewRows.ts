import type { ReactNode } from "react"
import { Ionicons } from "@expo/vector-icons"

import type { AppStoreState } from "@/core/models"
import type { AppTone } from "@/ui/composites/appTone"
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
  badgeTone?: AppTone
  route?: ProfileRoute
  destructive?: boolean
  showChevron?: boolean
  onPress?: () => void
  rightAccessory?: ReactNode
}

export function buildProfileOverviewSections({
  contractSummary,
  fullName,
  hasPendingContracts,
  hasRequiredDocuments,
  legalDocumentsSummary,
  payslipsSummary,
  notificationCount,
  state,
  themeContext,
}: {
  contractSummary: string
  fullName: string
  hasPendingContracts: boolean
  hasRequiredDocuments: boolean
  legalDocumentsSummary: string
  payslipsSummary: string
  notificationCount: number
  state: AppStoreState
  themeContext: "light" | "dark"
}) {
  const employersSummary =
    state.employers.length === 0
      ? "Link your first workplace"
      : state.employers.length === 1
        ? state.employers[0]?.name ?? "1 linked"
        : `${state.employers.length} linked`
  const contactSummary = state.profile.phone || "Add phone number"
  const addressSummary =
    state.profile.address.street && state.profile.address.postalCode
      ? `${state.profile.address.city}, ${state.profile.address.country}`
      : "Add home address"
  const bankSummary =
    maskIban(state.profile.bankAccount.iban) === "Not added"
      ? "Add payout account"
      : maskIban(state.profile.bankAccount.iban)
  const legalSummary =
    state.profile.legal.nationalRegisterNumber &&
    state.profile.legal.taxId &&
    state.profile.legal.socialSecurityNumber
      ? state.profile.legal.payrollStatus
      : "Finish payroll details"
  const hasContactGap = contactSummary === "Add phone number"
  const hasAddressGap = addressSummary === "Add home address"
  const hasBankGap = bankSummary === "Add payout account"
  const hasLegalGap = legalSummary === "Finish payroll details"
  const securitySummary = state.profile.security.faceIdEnabled
    ? `Password + ${state.profile.security.biometricType}`
    : "Password only"

  return {
    employment: [
      {
        icon: "business-outline",
        label: "Workplaces",
        route: "/profile/employers",
        value: employersSummary,
      },
      {
        badge: hasRequiredDocuments ? "Missing" : undefined,
        badgeTone: hasRequiredDocuments ? "danger" : undefined,
        icon: "shield-checkmark-outline",
        label: "Legal documents",
        route: "/profile/legal-documents",
        value: legalDocumentsSummary,
      },
      {
        badge: hasPendingContracts ? "Needed" : undefined,
        badgeTone: hasPendingContracts ? "accent" : undefined,
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
        badge: hasContactGap ? "Needed" : undefined,
        badgeTone: hasContactGap ? "accent" : undefined,
        icon: "mail-outline",
        label: "Contact details",
        route: "/profile/contact",
        value: contactSummary,
      },
      {
        badge: hasAddressGap ? "Needed" : undefined,
        badgeTone: hasAddressGap ? "accent" : undefined,
        icon: "location-outline",
        label: "Address",
        route: "/profile/address",
        value: addressSummary,
      },
      {
        badge: hasBankGap ? "Needed" : undefined,
        badgeTone: hasBankGap ? "accent" : undefined,
        icon: "card-outline",
        label: "Bank details",
        route: "/profile/banking",
        value: bankSummary,
      },
      {
        badge: hasLegalGap ? "Needed" : undefined,
        badgeTone: hasLegalGap ? "accent" : undefined,
        icon: "document-text-outline",
        label: "Legal information",
        route: "/profile/legal",
        value: legalSummary,
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
        value: securitySummary,
      },
      {
        icon: "lock-closed-outline",
        label: "Privacy",
        route: "/profile/privacy",
        value: "App diagnostics & sharing",
      },
    ],
    support: [
      {
        icon: "help-circle-outline",
        label: "Help & support",
        route: "/profile/support",
        value: "Get help or contact Vesta",
      },
    ],
  } satisfies Record<ProfileOverviewSection, ProfileOverviewRow[]>
}

export const PROFILE_OVERVIEW_ORDER = Object.keys(
  PROFILE_OVERVIEW_TITLES,
) as ProfileOverviewSection[]
