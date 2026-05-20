import { useCallback, useMemo, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"

import { createInitialState } from "@/core/mockState"
import { consumePendingEmployerInviteCode } from "@/features/employers/employerQrScanSession"
import {
  findEmployerByInviteCode,
  normalizeEmployerInviteCode,
} from "@/features/employers/employerInviteCode"
import { useProfileActions } from "@/features/profile/data/profile.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { useAppTheme, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import {
  createDirtyProfileState,
  createProfileFormState,
  saveProfileSection,
} from "./profileDetailFormState"
import type { JoinMode, SectionKey } from "./profileSections"

export function useProfileDetailScreen(section: SectionKey) {
  const router = useRouter()
  const { state: profileState } = useProfileStateQuery()
  const { joinEmployer: joinEmployerMutation, updateProfile } = useProfileActions()
  const { setThemeContextOverride, theme } = useAppTheme()
  const tokens = useDesignTokens()
  const state = profileState
    ? {
        ...createInitialState(),
        ...profileState,
      }
    : createInitialState()
  const formState = createProfileFormState(state.profile)

  const [personalState, setPersonalState] = useState(formState.personalState)
  const [contactState, setContactState] = useState(formState.contactState)
  const [addressState, setAddressState] = useState(formState.addressState)
  const [bankState, setBankState] = useState(formState.bankState)
  const [legalState, setLegalState] = useState(formState.legalState)
  const [joinMode, setJoinMode] = useState<JoinMode>("code")
  const [joinCode, setJoinCode] = useState("")
  const [joinSearch, setJoinSearch] = useState("")
  const [selectedJoinEmployerId, setSelectedJoinEmployerId] = useState<string | undefined>()
  const [joinedEmployerId, setJoinedEmployerId] = useState<string | undefined>()

  const availableEmployers = state.employerDirectory.filter(
    (employer) => !state.employers.some((existing) => existing.id === employer.id),
  )
  const codeMatchedEmployer = findEmployerByInviteCode(availableEmployers, joinCode)
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
    () =>
      createDirtyProfileState({
        addressState,
        bankState,
        contactState,
        legalState,
        personalState,
        profile: state.profile,
      }),
    [addressState, bankState, contactState, legalState, personalState, state.profile],
  )

  useFocusEffect(
    useCallback(() => {
      const scannedCode = consumePendingEmployerInviteCode()
      if (!scannedCode || section !== "join-employer") return

      setJoinMode("code")
      setJoinSearch("")
      setSelectedJoinEmployerId(undefined)
      setJoinedEmployerId(undefined)
      setJoinCode(normalizeEmployerInviteCode(scannedCode))
    }, [section]),
  )

  const saveCurrentSection = () =>
    saveProfileSection({
      addressState,
      bankState,
      contactState,
      dirtyState,
      legalState,
      onSaved: () => {
        fireHaptic("success")
        router.back()
      },
      personalState,
      section,
      updateProfile,
    })

  const joinEmployer = async (employerId: string) => {
    const result = await joinEmployerMutation(employerId)
    if (!result.ok) {
      fireHaptic("error")
      return result
    }

    fireHaptic("success")
    return result
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
        fireHaptic("warning")
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
        fireHaptic("success")
        updateProfile({
          security: {
            ...state.profile.security,
            biometricType,
            faceIdEnabled: true,
          },
        })
        return
      }

      fireHaptic("warning")
    } catch {
      fireHaptic("error")
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
    theme,
    tokens,
    updateFaceId,
    updateProfile,
  }
}

export type ProfileDetailScreenState = ReturnType<typeof useProfileDetailScreen>
