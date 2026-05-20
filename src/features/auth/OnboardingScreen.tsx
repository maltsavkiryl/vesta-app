import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AppButton, AppScrollScreen, MotionView, useDesignTokens } from "@/ui"

import { OnboardingAvailability } from "./onboarding/OnboardingAvailability"
import { OnboardingDone } from "./onboarding/OnboardingDone"
import { OnboardingEmployer } from "./onboarding/OnboardingEmployer"
import { OnboardingNotifications } from "./onboarding/OnboardingNotifications"
import { OnboardingRole } from "./onboarding/OnboardingRole"
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome"
import { ProgressDots } from "./onboarding/ProgressDots"
import { ONBOARDING_TOTAL_STEPS } from "./onboarding/types"
import { useOnboardingScreen } from "./useOnboardingScreen"

export function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const {
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
    roleLabel,
  } = useOnboardingScreen()

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
            codeHelperText={codeHelperText}
            joined={joined}
            joinMode={joinMode}
            search={search}
            searchResults={searchResults}
            selectedEmployerId={selectedEmployerId}
            onCodeChange={(value) => {
              setCode(value)
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
            onOpenQrScanner={() => router.push("/(auth)/employer-join-scanner")}
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
            role={roleLabel}
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
