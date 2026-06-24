import { useCallback, useEffect, useRef, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { createInitialState } from "@/core/mockState"
import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useProfileActions } from "@/features/profile/data/profile.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { createProfileFormState } from "@/features/profile/profileDetailFormState"
import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

import { ONBOARDING_TOTAL_STEPS } from "./onboarding/types"

export function useOnboardingScreen() {
  const router = useRouter()
  const { completeOnboarding } = useAuthActions()
  const { updateProfile } = useProfileActions()
  const { state: accountState } = useProfileStateQuery()

  // Seed the form from the loaded profile (empty for a brand-new employee).
  const profile = accountState?.profile ?? createInitialState().profile
  const initialForm = createProfileFormState(profile)

  const [step, setStep] = useState(0)
  const [personalState, setPersonalState] = useState(initialForm.personalState)
  const [contactState, setContactState] = useState(initialForm.contactState)
  const [bankState, setBankState] = useState(initialForm.bankState)
  const [legalState, setLegalState] = useState(initialForm.legalState)

  // Onboarding opens right after login, so the profile query may still be in
  // flight when this mounts — useState would then keep the fallback values even
  // after the real profile lands. Re-seed exactly once, when the profile first
  // arrives and before the employee has had a chance to edit anything.
  const seededRef = useRef(Boolean(accountState?.profile))
  useEffect(() => {
    if (seededRef.current || !accountState?.profile) return
    const form = createProfileFormState(accountState.profile)
    setPersonalState(form.personalState)
    setContactState(form.contactState)
    setBankState(form.bankState)
    setLegalState(form.legalState)
    seededRef.current = true
  }, [accountState?.profile])
  // Guards the final "complete onboarding" punch against double-taps while the
  // save + completion mutations are in flight.
  const [isCompleting, setIsCompleting] = useState(false)

  const hasName = Boolean(personalState.firstName.trim() && personalState.lastName.trim())
  // Welcome (0) and Done (2) always advance; the details step (1) needs a name.
  const canContinue = step === 1 ? hasName : true

  const complete = useCallback(async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      // Persist everything the employee entered before marking onboarding done.
      const saveResult = await updateProfile({
        ...personalState,
        ...contactState,
        bankAccount: bankState,
        legal: legalState,
      })
      if (!saveResult.ok) {
        fireHaptic("error")
        Alert.alert(translate("profile:alerts.saveFailedTitle"), saveResult.error.message)
        return
      }

      // Role/employer are no longer collected in onboarding; carry over whatever
      // the account already has (employer linking happens later from Profile).
      const result = await completeOnboarding({
        role: profile.role || "Other",
        employerId: accountState?.employers[0]?.id ?? "",
      })
      if (!result.ok) {
        fireHaptic("error")
        return
      }

      fireHaptic("success")
      router.replace("/")
    } finally {
      setIsCompleting(false)
    }
  }, [
    accountState?.employers,
    bankState,
    completeOnboarding,
    contactState,
    isCompleting,
    legalState,
    personalState,
    profile.role,
    router,
    updateProfile,
  ])

  const next = useCallback(() => {
    if (step === ONBOARDING_TOTAL_STEPS - 1) {
      void complete()
      return
    }
    setStep((current) => Math.min(ONBOARDING_TOTAL_STEPS - 1, current + 1))
  }, [complete, step])

  const back = useCallback(() => {
    setStep((current) => Math.max(0, current - 1))
  }, [])

  return {
    accountState,
    back,
    bankState,
    canContinue,
    complete,
    contactState,
    isCompleting,
    legalState,
    next,
    personalState,
    router,
    setBankState,
    setContactState,
    setLegalState,
    setPersonalState,
    step,
  }
}

export type OnboardingScreenState = ReturnType<typeof useOnboardingScreen>
