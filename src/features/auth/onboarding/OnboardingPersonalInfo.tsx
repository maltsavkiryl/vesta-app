import { View } from "react-native"

import {
  BankingEditSections,
  ContactEditSections,
  LegalEditSections,
  PersonalEditSections,
} from "@/features/profile/ProfileEditableSections"
import { translate } from "@/i18n/translate"
import { Text, appTypography, useDesignTokens } from "@/ui"

import type { OnboardingScreenState } from "../useOnboardingScreen"
import { onboardingStyles } from "./onboarding.styles"

type OnboardingPersonalInfoProps = Pick<
  OnboardingScreenState,
  | "bankState"
  | "contactState"
  | "legalState"
  | "personalState"
  | "setBankState"
  | "setContactState"
  | "setLegalState"
  | "setPersonalState"
>

export function OnboardingPersonalInfo({
  bankState,
  contactState,
  legalState,
  personalState,
  setBankState,
  setContactState,
  setLegalState,
  setPersonalState,
}: OnboardingPersonalInfoProps) {
  const tokens = useDesignTokens()

  return (
    <View style={onboardingStyles.section}>
      <View style={onboardingStyles.titleBlock}>
        <Text
          text={translate("onboarding:personal.title")}
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text={translate("onboarding:personal.subtitle")}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <PersonalEditSections personalState={personalState} setPersonalState={setPersonalState} />
      <ContactEditSections contactState={contactState} setContactState={setContactState} />
      <BankingEditSections bankState={bankState} setBankState={setBankState} />
      <LegalEditSections legalState={legalState} setLegalState={setLegalState} />
    </View>
  )
}
