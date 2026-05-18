/* eslint-disable react-native/no-inline-styles */

import { Alert, StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  AppearanceSection,
  BankingVerificationSection,
  EmployersSection,
  JoinEmployerSection,
  LANGUAGE_OPTIONS,
  LanguageSection,
  LegalPrivacyPreviewSection,
  NotificationPreferencesSection,
  PrivacySection,
  SectionFooter,
  SecuritySection,
  SupportSection,
  switchEmployerWithConfirmation,
  type SectionKey,
} from "@/features/profile/ProfileDetailSections"
import {
  AddressEditSections,
  BankingEditSections,
  ContactEditSections,
  LegalEditSections,
  PersonalEditSections,
} from "@/features/profile/ProfileEditableSections"
import { useProfileDetailScreen } from "@/features/profile/useProfileDetailScreen"
import { AppScrollScreen, createHeaderActionOptions, useDesignTokens } from "@/ui"
import { maskSensitiveId } from "@/utils/formatters"

const sectionMeta: Record<
  SectionKey,
  {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    subtitle: string
  }
> = {
  "address": {
    icon: "location-outline",
    subtitle: "The address used for official employment and payroll correspondence.",
    title: "Address",
  },
  "appearance": {
    icon: "color-palette-outline",
    subtitle: "Choose how Vesta should appear on this device.",
    title: "Appearance",
  },
  "banking": {
    icon: "card-outline",
    subtitle: "Payroll account and reimbursement details.",
    title: "Bank details",
  },
  "contact": {
    icon: "call-outline",
    subtitle: "How employers can reach you for urgent shift and payroll updates.",
    title: "Contact details",
  },
  "employers": {
    icon: "briefcase-outline",
    subtitle: "Restaurants and workplaces linked to your Vesta profile.",
    title: "Employers",
  },
  "join-employer": {
    icon: "add-circle-outline",
    subtitle: "Join another workplace with an invite code or by searching the directory.",
    title: "Join employer",
  },
  "legal": {
    icon: "shield-checkmark-outline",
    subtitle: "Private identity details required for compliant employment.",
    title: "Legal information",
  },
  "language": {
    icon: "globe-outline",
    subtitle: "Choose the language used throughout the app.",
    title: "Language",
  },
  "personal": {
    icon: "person-outline",
    subtitle: "Names, profile basics, and employee identity.",
    title: "Personal details",
  },
  "preferences": {
    icon: "notifications-outline",
    subtitle: "Choose how Vesta should notify you.",
    title: "Notifications",
  },
  "privacy": {
    icon: "lock-closed-outline",
    subtitle: "Control app analytics, diagnostics, and employer data sharing.",
    title: "Privacy",
  },
  "security": {
    icon: "shield-checkmark-outline",
    subtitle: "Manage your password and device unlock settings.",
    title: "Security",
  },
  "support": {
    icon: "help-circle-outline",
    subtitle: "Find answers or contact Vesta support.",
    title: "Help & support",
  },
}

function getSection(value?: string): SectionKey {
  return value === "personal" ||
    value === "contact" ||
    value === "address" ||
    value === "appearance" ||
    value === "preferences" ||
    value === "language" ||
    value === "employers" ||
    value === "join-employer" ||
    value === "banking" ||
    value === "legal" ||
    value === "security" ||
    value === "privacy" ||
    value === "support"
    ? value
    : "personal"
}

function isEditableSection(section: SectionKey) {
  return (
    section === "personal" ||
    section === "contact" ||
    section === "address" ||
    section === "banking" ||
    section === "legal"
  )
}

export function ProfileDetailScreen() {
  const router = useRouter()
  const { section: rawSection } = useLocalSearchParams<{ section?: string }>()
  const section = getSection(rawSection)
  const tokens = useDesignTokens()
  const {
    addressState,
    availableEmployers,
    bankState,
    codeMatchedEmployer,
    contactState,
    dirtyState,
    joinCode,
    joinEmployer,
    joinedEmployer,
    joinMode,
    joinSearch,
    legalState,
    personalState,
    saveCurrentSection,
    searchResults,
    selectedJoinEmployer,
    selectedJoinEmployerId,
    state,
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
    switchEmployer,
    theme,
    updateFaceId,
    updateProfile,
  } = useProfileDetailScreen(section)

  const currentSectionIsDirty =
    section in dirtyState ? dirtyState[section as keyof typeof dirtyState] : false
  const canSaveCurrentSection = isEditableSection(section)
  const closeSection = () => {
    if (section === "join-employer") {
      router.replace("/profile/employers")
      return
    }

    router.back()
  }
  const headerActions = createHeaderActionOptions(theme, {
    left: { kind: "close", onPress: closeSection },
    right: canSaveCurrentSection
      ? {
          disabled: !currentSectionIsDirty,
          kind: "confirm",
          onPress: saveCurrentSection,
        }
      : undefined,
  })

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          ...headerActions,
          title: sectionMeta[section].title,
        }}
      />
      <SectionFooter text={sectionMeta[section].subtitle} />

      {section === "personal" ? (
        <>
          <PersonalEditSections personalState={personalState} setPersonalState={setPersonalState} />
        </>
      ) : null}

      {section === "contact" ? (
        <>
          <ContactEditSections contactState={contactState} setContactState={setContactState} />
          <SectionFooter text="Your active employer can use these details for schedule changes and urgent shift updates." />
        </>
      ) : null}

      {section === "address" ? (
        <>
          <AddressEditSections addressState={addressState} setAddressState={setAddressState} />
          <SectionFooter text="This address is used for employment records, payroll correspondence, and legally required mail." />
        </>
      ) : null}

      {section === "appearance" ? (
        <AppearanceSection
          selectedTheme={state.profile.themePreference}
          onSelectTheme={(themePreference) => {
            updateProfile({ themePreference })
            setThemeContextOverride(themePreference === "system" ? undefined : themePreference)
          }}
        />
      ) : null}

      {section === "preferences" ? (
        <NotificationPreferencesSection
          notificationPreferences={state.profile.notificationPreferences}
          onToggle={(key, enabled) =>
            updateProfile({
              notificationPreferences: {
                ...state.profile.notificationPreferences,
                [key]: !enabled,
              },
            })
          }
          tokens={tokens}
        />
      ) : null}

      {section === "language" ? (
        <LanguageSection
          currentLanguage={state.profile.language as (typeof LANGUAGE_OPTIONS)[number]}
          onSelectLanguage={(language) => updateProfile({ language })}
          tokens={tokens}
        />
      ) : null}

      {section === "employers" ? (
        <EmployersSection
          availableEmployers={availableEmployers}
          employers={state.employers}
          onJoinEmployer={joinEmployer}
          onOpenJoinEmployer={() => router.push("/profile/join-employer")}
          onSwitchEmployer={(employerId) =>
            switchEmployerWithConfirmation({
              employerId,
              employers: state.employers,
              router,
              switchEmployer,
            })
          }
          tokens={tokens}
        />
      ) : null}

      {section === "join-employer" ? (
        <JoinEmployerSection
          availableEmployers={availableEmployers}
          codeMatchedEmployer={codeMatchedEmployer}
          joinCode={joinCode}
          joinedEmployer={joinedEmployer}
          joinMode={joinMode}
          joinSearch={joinSearch}
          onChangeMode={(mode) => {
            setJoinMode(mode)
            setJoinCode("")
            setJoinSearch("")
            setSelectedJoinEmployerId(undefined)
            setJoinedEmployerId(undefined)
          }}
          onChangeSearch={(value) => {
            setJoinSearch(value)
            setSelectedJoinEmployerId(undefined)
            setJoinedEmployerId(undefined)
          }}
          onJoinSelectedEmployer={() => {
            if (!selectedJoinEmployer) return
            joinEmployer(selectedJoinEmployer.id)
            setJoinedEmployerId(selectedJoinEmployer.id)
          }}
          onSetJoinCode={(value) => {
            setJoinCode(value.toUpperCase())
            setJoinedEmployerId(undefined)
          }}
          onSelectEmployer={(employerId) => {
            setSelectedJoinEmployerId(employerId)
            setJoinedEmployerId(undefined)
          }}
          router={router}
          searchResults={searchResults}
          selectedJoinEmployer={selectedJoinEmployer}
          selectedJoinEmployerId={selectedJoinEmployerId}
          tokens={tokens}
        />
      ) : null}

      {section === "security" ? (
        <SecuritySection
          biometricType={state.profile.security.biometricType}
          faceIdEnabled={state.profile.security.faceIdEnabled}
          onChangePassword={() =>
            Alert.alert(
              "Change password",
              "Password changes will be available when production authentication is connected.",
            )
          }
          onToggleFaceId={() => updateFaceId(!state.profile.security.faceIdEnabled)}
          passwordLastChangedAt={state.profile.security.passwordLastChangedAt}
          tokens={tokens}
        />
      ) : null}

      {section === "privacy" ? (
        <PrivacySection
          analyticsEnabled={state.profile.privacy.analyticsEnabled}
          crashReportsEnabled={state.profile.privacy.crashReportsEnabled}
          employerDataSharingEnabled={state.profile.privacy.employerDataSharingEnabled}
          onToggleAnalytics={() =>
            updateProfile({
              privacy: {
                ...state.profile.privacy,
                analyticsEnabled: !state.profile.privacy.analyticsEnabled,
              },
            })
          }
          onToggleCrashReports={() =>
            updateProfile({
              privacy: {
                ...state.profile.privacy,
                crashReportsEnabled: !state.profile.privacy.crashReportsEnabled,
              },
            })
          }
          onToggleEmployerSharing={() =>
            updateProfile({
              privacy: {
                ...state.profile.privacy,
                employerDataSharingEnabled: !state.profile.privacy.employerDataSharingEnabled,
              },
            })
          }
          tokens={tokens}
        />
      ) : null}

      {section === "support" ? (
        <SupportSection
          onOpenClockHelp={() =>
            Alert.alert(
              "Clocking in and out",
              "Use the Time tab to start work, begin breaks, and confirm clock-out totals.",
            )
          }
          onOpenDocsHelp={() =>
            Alert.alert(
              "Documents and payroll",
              "Use Documents to upload missing files, review contracts, and open payslips.",
            )
          }
          onOpenScheduleHelp={() =>
            Alert.alert(
              "Schedules and availability",
              "Use Schedule to review shifts, set availability, and request changes.",
            )
          }
          onOpenSupportComposer={() =>
            Alert.alert("Support request", "A support message composer will open here.")
          }
          onReportProblem={() =>
            Alert.alert("Report a problem", "A diagnostics report will be prepared here.")
          }
          tokens={tokens}
        />
      ) : null}

      {section === "banking" ? (
        <>
          <BankingEditSections bankState={bankState} setBankState={setBankState} />
          <SectionFooter text="Bank details are masked in the app and only used by payroll once your employer verifies them." />
          <BankingVerificationSection hasIban={Boolean(bankState.iban)} tokens={tokens} />
        </>
      ) : null}

      {section === "legal" ? (
        <>
          <LegalEditSections legalState={legalState} setLegalState={setLegalState} />
          <SectionFooter text="Identity numbers stay hidden after saving. Vesta only exposes what payroll and employment compliance require." />
          <LegalPrivacyPreviewSection
            maskedNationalNumber={maskSensitiveId(legalState.nationalRegisterNumber)}
            tokens={tokens}
          />
        </>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
    paddingHorizontal: 16,
  },
})
