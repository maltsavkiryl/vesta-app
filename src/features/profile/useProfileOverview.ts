import { useMemo } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { createInitialState } from "@/core/mockState"
import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useDocumentsStateQuery } from "@/features/documents/data/documents.queries"
import { payslips } from "@/features/documents/documents.data"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { useAppTheme } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { PROFILE_OVERVIEW_ORDER, buildProfileOverviewSections } from "./profileOverviewRows"
import { PROFILE_OVERVIEW_TITLES } from "./profileSections"

function capitalize(value?: string) {
  if (!value) return "Waiter"
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase()
}

export function useProfileOverview() {
  const router = useRouter()
  const { themeContext } = useAppTheme()
  const { signOut } = useAuthActions()
  const { contracts, documents } = useDocumentsStateQuery()
  const { state: profileState } = useProfileStateQuery()
  const state = useMemo(
    () => ({
      ...createInitialState(),
      ...profileState,
    }),
    [profileState],
  )

  const fullName = `${state.profile.firstName} ${state.profile.lastName}`
  const notificationCount = Object.values(state.profile.notificationPreferences).filter(
    Boolean,
  ).length
  const pendingDocumentCount = documents.filter(
    (document) => document.status === "action_required",
  ).length
  const pendingContractCount = contracts.filter((contract) => contract.status === "pending").length
  const latestPayslip = payslips[0]

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You'll need to sign in again to access your account.", [
      { style: "cancel", text: "Cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut().then(() => {
            fireHaptic("success")
            router.replace("/(auth)/sign-in")
          })
        },
      },
    ])
  }

  return {
    email: state.profile.email,
    fullName,
    initials: getInitials(state.profile.firstName, state.profile.lastName),
    profileCompleteness: 95,
    role: capitalize(state.profile.role),
    sections: buildProfileOverviewSections({
      contractSummary:
        pendingContractCount > 0
          ? `${pendingContractCount} awaiting signature`
          : contracts.length > 0
            ? `${contracts.length} on file`
            : "No contracts",
      fullName,
      legalDocumentsSummary:
        pendingDocumentCount > 0 ? `${pendingDocumentCount} required` : "All set",
      payslipsSummary: latestPayslip?.month ?? "No payslips",
      notificationCount,
      state,
      themeContext,
    }),
    sectionOrder: PROFILE_OVERVIEW_ORDER,
    sectionTitles: PROFILE_OVERVIEW_TITLES,
    signOutRow: {
      destructive: true,
      icon: "log-out-outline" as const,
      label: "Sign out",
      onPress: handleSignOut,
      showChevron: false,
    },
    versionLabel: "Vesta Employee · v1.0.0",
  }
}
