import { useMemo, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { createInitialState } from "@/core/mockState"
import { useProfileActions } from "@/features/profile/data/profile.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { translate } from "@/i18n/translate"
import { useAppTheme, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import {
  createDirtyProfileState,
  createProfileFormState,
  saveProfileSection,
} from "./profileDetailFormState"
import type { SectionKey } from "./profileSections"
import { useProfileJoinEmployer } from "./useProfileJoinEmployer"

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
  const joinEmployerState = useProfileJoinEmployer({
    employers: state.employers,
    employerDirectory: state.employerDirectory,
    joinEmployerMutation,
    section,
  })

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

  const saveCurrentSection = () =>
    saveProfileSection({
      addressState,
      bankState,
      contactState,
      dirtyState,
      legalState,
      onError: (message) => {
        fireHaptic("error")
        Alert.alert(translate("profile:alerts.saveFailedTitle"), message)
      },
      onSaved: () => {
        fireHaptic("success")
        router.back()
      },
      personalState,
      section,
      updateProfile,
    })

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
          translate("profile:alerts.faceIdUnavailableTitle"),
          translate("profile:security.setupBiometricFirst"),
        )
        return
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
      const biometricType = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
        ? "Face ID"
        : translate("profile:security.biometricUnlock")
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: translate("profile:security.usePasscode"),
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
      Alert.alert(
        translate("profile:alerts.faceIdUnavailableTitle"),
        translate("profile:security.biometricDevBuild"),
      )
    }
  }

  return {
    addressState,
    bankState,
    contactState,
    dirtyState,
    legalState,
    personalState,
    router,
    saveCurrentSection,
    section,
    setAddressState,
    setBankState,
    setContactState,
    setLegalState,
    setPersonalState,
    setThemeContextOverride,
    state,
    theme,
    tokens,
    updateFaceId,
    updateProfile,
    ...joinEmployerState,
  }
}

export type ProfileDetailScreenState = ReturnType<typeof useProfileDetailScreen>
