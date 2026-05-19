import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { AppButton, AppScrollScreen, MotionView, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { OnboardingAvailability } from "./onboarding/OnboardingAvailability"
import { OnboardingDone } from "./onboarding/OnboardingDone"
import { OnboardingEmployer } from "./onboarding/OnboardingEmployer"
import { OnboardingNotifications } from "./onboarding/OnboardingNotifications"
import { OnboardingRole } from "./onboarding/OnboardingRole"
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome"
import { ProgressDots } from "./onboarding/ProgressDots"
import { ONBOARDING_ROLES, ONBOARDING_TOTAL_STEPS } from "./onboarding/types"

export function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
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
  const foundEmployer = employers.find(
    (employer) => employer.code.toUpperCase() === code.toUpperCase(),
  )
  const searchResults =
    search.trim().length > 1
      ? employers.filter(
          (employer) =>
            employer.name.toLowerCase().includes(search.toLowerCase()) ||
            employer.city.toLowerCase().includes(search.toLowerCase()),
        )
      : []
  const activeEmployer = foundEmployer ?? selectedEmployer
  const canContinue = [
    true,
    Boolean(selectedRole),
    joined || Boolean(activeEmployer),
    availabilityDays.length > 0,
    true,
    true,
  ][step]

  const complete = async () => {
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
  }

  const next = () => {
    if (step === ONBOARDING_TOTAL_STEPS - 1) {
      complete()
      return
    }
    if (step === 2 && activeEmployer) {
      setSelectedEmployerId(activeEmployer.id)
      setJoined(true)
    }
    setStep((current) => Math.min(ONBOARDING_TOTAL_STEPS - 1, current + 1))
  }

  const back = () => setStep((current) => Math.max(0, current - 1))

  if (step === 0) {
    return (
      <OnboardingWelcome
        firstName={accountState?.profile.firstName ?? "there"}
        onSkip={complete}
        onStart={next}
      />
    )
  }

  return (
    <AppScrollScreen contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.stepHeader}>
        <Pressable
          onPress={back}
          style={[
            styles.backButton,
            { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
          ]}
        >
          <Ionicons color={tokens.textPrimary} name="chevron-back-outline" size={16} />
        </Pressable>
        <ProgressDots step={step - 1} />
        <View style={styles.backButtonSpacer} />
      </View>

      <MotionView delay={55} key={step} style={styles.stepContent}>
        {step === 1 ? (
          <OnboardingRole selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        ) : null}
        {step === 2 ? (
          <OnboardingEmployer
            code={code}
            joined={joined}
            joinMode={joinMode}
            search={search}
            searchResults={searchResults}
            selectedEmployerId={selectedEmployerId}
            onCodeChange={(value) => {
              setCode(
                value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 6),
              )
              setJoined(false)
            }}
            onJoin={() => {
              if (activeEmployer) {
                setSelectedEmployerId(activeEmployer.id)
                setJoined(true)
              }
            }}
            onModeChange={(mode) => {
              setJoinMode(mode)
              setCode("")
              setSearch("")
              setJoined(false)
            }}
            onSearchChange={setSearch}
            onSelectEmployer={(id) => {
              setSelectedEmployerId(id)
              setJoined(false)
            }}
            previewEmployer={activeEmployer}
          />
        ) : null}
        {step === 3 ? (
          <OnboardingAvailability
            availabilityDays={availabilityDays}
            onDayToggle={(day) =>
              setAvailabilityDays((current) =>
                current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
              )
            }
            onTimeSlotChange={setTimeSlot}
            timeSlot={timeSlot}
          />
        ) : null}
        {step === 4 ? (
          <OnboardingNotifications
            notifications={notifications}
            onToggle={(key) =>
              setNotifications((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
          />
        ) : null}
        {step === 5 ? (
          <OnboardingDone
            availabilityDays={availabilityDays}
            employerName={activeEmployer?.name}
            enabledNotifications={Object.values(notifications).filter(Boolean).length}
            role={ONBOARDING_ROLES.find((item) => item.id === selectedRole)?.label ?? selectedRole}
          />
        ) : null}
      </MotionView>

      <MotionView delay={95}>
        <AppButton
          disabled={!canContinue}
          label={
            step === 5 ? "Start using Vesta" : step === 2 && !joined ? "Skip for now" : "Continue"
          }
          onPress={next}
          pressHaptic={step === 5 ? "none" : "selection"}
        />
      </MotionView>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  backButtonSpacer: {
    width: 32,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 24,
  },
  stepHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
})
