import { useMemo, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { createInitialState } from "@/core/mockState"
import { useProfileActions } from "@/features/profile/data/profile.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { useAppTheme } from "@/ui"

import type { JoinMode, SectionKey } from "./ProfileDetailSections"

export function useProfileDetailScreen(section: SectionKey) {
  const router = useRouter()
  const { state: profileState } = useProfileStateQuery()
  const { joinEmployer, switchEmployer, updateProfile } = useProfileActions()
  const { setThemeContextOverride, theme } = useAppTheme()
  const state = profileState
    ? {
        ...createInitialState(),
        ...profileState,
      }
    : createInitialState()

  const [personalState, setPersonalState] = useState({
    bio: state.profile.bio,
    dateOfBirth: state.profile.dateOfBirth,
    firstName: state.profile.firstName,
    lastName: state.profile.lastName,
    nationality: state.profile.nationality,
    preferredName: state.profile.preferredName,
  })
  const [contactState, setContactState] = useState({
    email: state.profile.email,
    emergencyContact: state.profile.emergencyContact,
    phone: state.profile.phone,
  })
  const [addressState, setAddressState] = useState({
    address: state.profile.address,
    homeCity: state.profile.homeCity,
  })
  const [bankState, setBankState] = useState(state.profile.bankAccount)
  const [legalState, setLegalState] = useState(state.profile.legal)
  const [joinMode, setJoinMode] = useState<JoinMode>("code")
  const [joinCode, setJoinCode] = useState("")
  const [joinSearch, setJoinSearch] = useState("")
  const [selectedJoinEmployerId, setSelectedJoinEmployerId] = useState<string | undefined>()
  const [joinedEmployerId, setJoinedEmployerId] = useState<string | undefined>()

  const availableEmployers = state.employerDirectory.filter(
    (employer) => !state.employers.some((existing) => existing.id === employer.id),
  )
  const normalizedJoinCode = joinCode.trim().toUpperCase()
  const codeMatchedEmployer = availableEmployers.find(
    (employer) => employer.code.toUpperCase() === normalizedJoinCode,
  )
  const searchResults = availableEmployers.filter((employer) => {
    const query = joinSearch.trim().toLowerCase()
    if (!query) return true

    return (
      employer.name.toLowerCase().includes(query) ||
      employer.type.toLowerCase().includes(query) ||
      employer.city.toLowerCase().includes(query) ||
      employer.code.toLowerCase().includes(query)
    )
  })
  const selectedJoinEmployer =
    joinMode === "code"
      ? codeMatchedEmployer
      : availableEmployers.find((employer) => employer.id === selectedJoinEmployerId)
  const joinedEmployer = state.employers.find((employer) => employer.id === joinedEmployerId)

  const dirtyState = useMemo(
    () => ({
      address:
        JSON.stringify(addressState) !==
        JSON.stringify({
          address: state.profile.address,
          homeCity: state.profile.homeCity,
        }),
      banking: JSON.stringify(bankState) !== JSON.stringify(state.profile.bankAccount),
      contact:
        JSON.stringify(contactState) !==
        JSON.stringify({
          email: state.profile.email,
          emergencyContact: state.profile.emergencyContact,
          phone: state.profile.phone,
        }),
      legal: JSON.stringify(legalState) !== JSON.stringify(state.profile.legal),
      personal:
        JSON.stringify(personalState) !==
        JSON.stringify({
          bio: state.profile.bio,
          dateOfBirth: state.profile.dateOfBirth,
          firstName: state.profile.firstName,
          lastName: state.profile.lastName,
          nationality: state.profile.nationality,
          preferredName: state.profile.preferredName,
        }),
    }),
    [addressState, bankState, contactState, legalState, personalState, state.profile],
  )

  const saveCurrentSection = () => {
    if (section === "personal" && dirtyState.personal) {
      updateProfile(personalState)
      router.back()
    }

    if (section === "contact" && dirtyState.contact) {
      updateProfile(contactState)
      router.back()
    }

    if (section === "address" && dirtyState.address) {
      updateProfile(addressState)
      router.back()
    }

    if (section === "banking" && dirtyState.banking) {
      updateProfile({ bankAccount: bankState })
      router.back()
    }

    if (section === "legal" && dirtyState.legal) {
      updateProfile({ legal: legalState })
      router.back()
    }
  }

  const updateFaceId = async (enabled: boolean) => {
    if (!enabled) {
      updateProfile({
        security: {
          ...state.profile.security,
          faceIdEnabled: false,
        },
      })
      return
    }

    try {
      const LocalAuthentication = await import("expo-local-authentication")
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Face ID unavailable",
          "Set up Face ID or another biometric unlock method on this device first.",
        )
        return
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
      const biometricType = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
        ? "Face ID"
        : "Biometric unlock"
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: "Use passcode",
        promptMessage: `Enable ${biometricType}`,
      })

      if (result.success) {
        updateProfile({
          security: {
            ...state.profile.security,
            biometricType,
            faceIdEnabled: true,
          },
        })
      }
    } catch {
      Alert.alert("Face ID unavailable", "Rebuild the development app to enable Face ID.")
    }
  }

  return {
    addressState,
    availableEmployers,
    bankState,
    codeMatchedEmployer,
    contactState,
    dirtyState,
    joinCode,
    joinEmployer,
    joinedEmployer,
    joinedEmployerId,
    joinMode,
    joinSearch,
    legalState,
    personalState,
    router,
    saveCurrentSection,
    searchResults,
    section,
    selectedJoinEmployer,
    selectedJoinEmployerId,
    setAddressState,
    setBankState,
    setContactState,
    setJoinCode,
    setJoinedEmployerId,
    setJoinMode,
    setJoinSearch,
    setLegalState,
    setPersonalState,
    setSelectedJoinEmployerId,
    setThemeContextOverride,
    state,
    switchEmployer,
    theme,
    updateFaceId,
    updateProfile,
  }
}
