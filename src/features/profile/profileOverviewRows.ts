import type { ReactNode } from "react"
import { Ionicons } from "@expo/vector-icons"

import type { AppStoreState } from "@/core/models"
import { translate } from "@/i18n/translate"
import type { AppTone } from "@/ui/composites/appTone"
import { maskIban } from "@/utils/formatters"

import {
  PROFILE_OVERVIEW_TITLE_KEYS,
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
      ? translate("profile:overviewRows.linkFirst")
      : state.employers.length === 1
        ? (state.employers[0]?.name ?? translate("profile:overviewRows.linkedCount", { count: 1 }))
        : translate("profile:overviewRows.linkedCount", { count: state.employers.length })
  const contactSummary = state.profile.phone || translate("profile:overviewRows.addPhone")
  const addressSummary =
    state.profile.address.street && state.profile.address.postalCode
      ? `${state.profile.address.city}, ${state.profile.address.country}`
      : translate("profile:overviewRows.addAddress")
  const bankSummary =
    maskIban(state.profile.bankAccount.iban) === "Not added"
      ? translate("profile:overviewRows.addPayout")
      : maskIban(state.profile.bankAccount.iban)
  const legalSummary =
    state.profile.legal.nationalRegisterNumber &&
    state.profile.legal.taxId &&
    state.profile.legal.socialSecurityNumber
      ? state.profile.legal.payrollStatus
      : translate("profile:overviewRows.finishPayroll")
  const hasContactGap = contactSummary === translate("profile:overviewRows.addPhone")
  const hasAddressGap = addressSummary === translate("profile:overviewRows.addAddress")
  const hasBankGap = bankSummary === translate("profile:overviewRows.addPayout")
  const hasLegalGap = legalSummary === translate("profile:overviewRows.finishPayroll")
  const securitySummary = state.profile.security.faceIdEnabled
    ? translate("profile:overviewRows.passwordPlus", { type: state.profile.security.biometricType })
    : translate("profile:overviewRows.passwordOnly")

  return {
    employment: [
      {
        icon: "business-outline",
        label: translate("profile:sectionMeta.workplacesLabel"),
        route: "/profile/employers",
        value: employersSummary,
      },
      {
        badge: hasRequiredDocuments ? translate("profile:overviewRows.badgeMissing") : undefined,
        badgeTone: hasRequiredDocuments ? "danger" : undefined,
        icon: "shield-checkmark-outline",
        label: translate("profile:sectionMeta.legalDocumentsTitle"),
        route: "/profile/legal-documents",
        value: legalDocumentsSummary,
      },
      {
        badge: hasPendingContracts ? translate("profile:overviewRows.badgeNeeded") : undefined,
        badgeTone: hasPendingContracts ? "accent" : undefined,
        icon: "document-text-outline",
        label: translate("profile:sectionMeta.contractsTitle"),
        route: "/profile/contracts",
        value: contractSummary,
      },
      {
        icon: "cash-outline",
        label: translate("profile:sectionMeta.payslipsTitle"),
        route: "/profile/payslips",
        value: payslipsSummary,
      },
    ],
    personal: [
      {
        icon: "person-outline",
        label: translate("profile:sectionMeta.personalTitle"),
        route: "/profile/personal",
        value: fullName,
      },
      {
        badge: hasContactGap ? translate("profile:overviewRows.badgeNeeded") : undefined,
        badgeTone: hasContactGap ? "accent" : undefined,
        icon: "mail-outline",
        label: translate("profile:sectionMeta.contactTitle"),
        route: "/profile/contact",
        value: contactSummary,
      },
      {
        badge: hasAddressGap ? translate("profile:overviewRows.badgeNeeded") : undefined,
        badgeTone: hasAddressGap ? "accent" : undefined,
        icon: "location-outline",
        label: translate("profile:sectionMeta.addressTitle"),
        route: "/profile/address",
        value: addressSummary,
      },
      {
        badge: hasBankGap ? translate("profile:overviewRows.badgeNeeded") : undefined,
        badgeTone: hasBankGap ? "accent" : undefined,
        icon: "card-outline",
        label: translate("profile:sectionMeta.bankingTitle"),
        route: "/profile/banking",
        value: bankSummary,
      },
      {
        badge: hasLegalGap ? translate("profile:overviewRows.badgeNeeded") : undefined,
        badgeTone: hasLegalGap ? "accent" : undefined,
        icon: "document-text-outline",
        label: translate("profile:sectionMeta.legalTitle"),
        route: "/profile/legal",
        value: legalSummary,
      },
    ],
    settings: [
      {
        icon: themeContext === "dark" ? "moon-outline" : "sunny-outline",
        label: translate("profile:sectionMeta.appearanceTitle"),
        route: "/profile/appearance",
        value:
          themeContext === "dark"
            ? translate("profile:overviewRows.dark")
            : translate("profile:overviewRows.light"),
      },
      {
        icon: "notifications-outline",
        label: translate("profile:sectionMeta.preferencesTitle"),
        route: "/profile/preferences",
        value: translate("profile:overviewRows.enabledCount", { count: notificationCount }),
      },
      {
        icon: "globe-outline",
        label: translate("profile:sectionMeta.languageTitle"),
        route: "/profile/language",
        value: state.profile.language,
      },
      {
        icon: "shield-checkmark-outline",
        label: translate("profile:sectionMeta.securityTitle"),
        route: "/profile/security",
        value: securitySummary,
      },
      {
        icon: "lock-closed-outline",
        label: translate("profile:sectionMeta.privacyTitle"),
        route: "/profile/privacy",
        value: translate("profile:sectionMeta.privacyValue"),
      },
    ],
    support: [
      {
        icon: "help-circle-outline",
        label: translate("profile:sectionMeta.supportTitle"),
        route: "/profile/support",
        value: translate("profile:sectionMeta.supportValue"),
      },
    ],
  } satisfies Record<ProfileOverviewSection, ProfileOverviewRow[]>
}

export const PROFILE_OVERVIEW_ORDER = Object.keys(
  PROFILE_OVERVIEW_TITLE_KEYS,
) as ProfileOverviewSection[]
