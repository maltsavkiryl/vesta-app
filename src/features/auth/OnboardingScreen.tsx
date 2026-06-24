import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { translate } from "@/i18n/translate"
import { AppButton, AppScrollScreen, MotionView, useDesignTokens } from "@/ui"

import { OnboardingDone } from "./onboarding/OnboardingDone"
import { OnboardingPersonalInfo } from "./onboarding/OnboardingPersonalInfo"
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome"
import { ProgressDots } from "./onboarding/ProgressDots"
import { useOnboardingScreen } from "./useOnboardingScreen"

export function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const {
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
    setBankState,
    setContactState,
    setLegalState,
    setPersonalState,
    step,
  } = useOnboardingScreen()

  if (step === 0) {
    return (
      <OnboardingWelcome
        firstName={accountState?.profile.firstName ?? ""}
        onSkip={complete}
        onStart={next}
      />
    )
  }

  return (
    <AppScrollScreen contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.stepHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate("common:actions.back")}
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
          <OnboardingPersonalInfo
            bankState={bankState}
            contactState={contactState}
            legalState={legalState}
            personalState={personalState}
            setBankState={setBankState}
            setContactState={setContactState}
            setLegalState={setLegalState}
            setPersonalState={setPersonalState}
          />
        ) : null}
        {step === 2 ? (
          <OnboardingDone
            email={contactState.email}
            fullName={`${personalState.firstName} ${personalState.lastName}`.trim()}
            phone={contactState.phone}
          />
        ) : null}
      </MotionView>

      <MotionView delay={95}>
        <AppButton
          disabled={!canContinue || isCompleting}
          label={
            step === 2
              ? translate("onboarding:startUsingVesta")
              : translate("common:actions.continue")
          }
          onPress={next}
          pressHaptic={step === 2 ? "none" : "selection"}
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
