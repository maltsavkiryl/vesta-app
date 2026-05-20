import { useCallback, useMemo, useState } from "react"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"

import { consumePendingEmployerInviteCode } from "@/features/employers/employerQrScanSession"
import {
  findEmployerByInviteCode,
  normalizeEmployerInviteCode,
} from "@/features/employers/employerInviteCode"
import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { fireHaptic } from "@/utils/haptics"

import { ONBOARDING_ROLES, ONBOARDING_TOTAL_STEPS } from "./onboarding/types"

export function useOnboardingScreen() {
  const router = useRouter()
  const { completeOnboarding } = useAuthActions()
  const { state: accountState } = useProfileStateQuery()

  const initialEmployerId = accountState?.employers[0]?.id ?? ""
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState(accountState?.profile.role ?? "")
  const [selectedEmployerId, setSelectedEmployerId] = useState(initialEmployerId)
  const [joinMode, setJoinMode] = useState<"code" | "search">("code")
  const [code, setCode] = useState("")
  const [search, setSearch] = useState("")
  const [joined, setJoined] = useState(Boolean(initialEmployerId))
  const [availabilityDays, setAvailabilityDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"])
  const [timeSlot, setTimeSlot] = useState("evenings")
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    shifts: true,
    schedule: true,
    payslips: true,
    timeoff: true,
    updates: false,
  })

  const employers = useMemo(
    () => [
      ...(accountState?.employers ?? []),
      ...(accountState?.employerDirectory.filter(
        (employer) =>
          !(accountState?.employers ?? []).some(
            (joinedEmployer) => joinedEmployer.id === employer.id,
          ),
      ) ?? []),
    ],
    [accountState?.employerDirectory, accountState?.employers],
  )

  const selectedEmployer = employers.find((employer) => employer.id === selectedEmployerId)
  const foundEmployer = findEmployerByInviteCode(employers, code)
  const searchResults =
    search.trim().length > 1
      ? employers.filter(
          (employer) =>
            employer.name.toLowerCase().includes(search.toLowerCase()) ||
            employer.city.toLowerCase().includes(search.toLowerCase()),
        )
      : []
  const activeEmployer = foundEmployer ?? selectedEmployer
  const codeHelperText =
    code.length === 0
      ? "Type or paste your invite code"
      : code.length < 6
        ? `${6 - code.length} more character${code.length === 5 ? "" : "s"}`
        : foundEmployer
          ? "Employer found!"
          : "Code not recognized"
  const canContinue = [
    true,
    Boolean(selectedRole),
    joined || Boolean(activeEmployer),
    availabilityDays.length > 0,
    true,
    true,
  ][step]

  useFocusEffect(
    useCallback(() => {
      const scannedCode = consumePendingEmployerInviteCode()
      if (!scannedCode) return

      setJoinMode("code")
      setSearch("")
      setJoined(false)
      setCode(normalizeEmployerInviteCode(scannedCode))
    }, []),
  )

  const complete = useCallback(async () => {
    const result = await completeOnboarding({
      role: selectedRole || "Waiter",
      employerId: (activeEmployer ?? accountState?.employers[0])?.id ?? "",
    })
    if (!result.ok) {
      fireHaptic("error")
      return
    }
    fireHaptic("success")
    router.replace("/")
  }, [accountState?.employers, activeEmployer, completeOnboarding, router, selectedRole])

  const next = useCallback(() => {
    if (step === ONBOARDING_TOTAL_STEPS - 1) {
      void complete()
      return
    }

    if (step === 2 && activeEmployer) {
      setSelectedEmployerId(activeEmployer.id)
      setJoined(true)
    }

    setStep((current) => Math.min(ONBOARDING_TOTAL_STEPS - 1, current + 1))
  }, [activeEmployer, complete, step])

  const back = useCallback(() => {
    setStep((current) => Math.max(0, current - 1))
  }, [])

  return {
    accountState,
    activeEmployer,
    availabilityDays,
    back,
    canContinue,
    code,
    codeHelperText,
    complete,
    joinMode,
    joined,
    next,
    notifications,
    router,
    search,
    searchResults,
    selectedEmployerId,
    selectedRole,
    setAvailabilityDays,
    setCode,
    setJoinMode,
    setJoined,
    setNotifications,
    setSearch,
    setSelectedEmployerId,
    setSelectedRole,
    setTimeSlot,
    step,
    timeSlot,
    roleLabel: ONBOARDING_ROLES.find((item) => item.id === selectedRole)?.label ?? selectedRole,
  }
}

export type OnboardingScreenState = ReturnType<typeof useOnboardingScreen>
