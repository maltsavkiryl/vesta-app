import type { ReactNode } from "react"
import { Alert } from "react-native"
import { usePathname } from "expo-router"

import {
  ChangePasswordSection,
  LanguageSection,
  NotificationPreferencesSection,
  PrivacySection,
  SecuritySection,
  SupportSection,
} from "@/features/profile/ProfileDetailSections"
import {
  AppearanceSection,
  LANGUAGE_OPTIONS,
  MotionSection,
} from "@/features/profile/sections/ProfileSectionShared"
import { openSupportComposer, reportProblem } from "@/features/profile/supportEmail"
import { useAppSession } from "@/providers/app-provider"

import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

function SupportSectionContent({
  state,
  tokens,
}: Pick<ProfileDetailScreenState, "state" | "tokens">) {
  const pathname = usePathname()
  const { accountId } = useAppSession()
  const diagnostics = {
    accountEmail: state.profile.email,
    accountId,
    analyticsEnabled: state.profile.privacy.analyticsEnabled,
    crashReportsEnabled: state.profile.privacy.crashReportsEnabled,
    currentRoute: pathname,
    employerDataSharingEnabled: state.profile.privacy.employerDataSharingEnabled,
  }

  return (
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
          "Use Legal documents, Contracts, and Payslips in Profile to manage your payroll paperwork.",
        )
      }
      onOpenScheduleHelp={() =>
        Alert.alert(
          "Schedules and availability",
          "Use Schedule to review shifts, set availability, and request changes.",
        )
      }
      onOpenSupportComposer={() => {
        void openSupportComposer(diagnostics)
      }}
      onReportProblem={() => {
        void reportProblem(diagnostics)
      }}
      tokens={tokens}
    />
  )
}

export const SETTINGS_SECTION_CONTENT: Partial<
  Record<
    SectionKey,
    {
      editable: boolean
      render: (screen: ProfileDetailScreenState) => ReactNode
    }
  >
> = {
  "appearance": {
    editable: false,
    render: ({ setThemeContextOverride, state, updateProfile }) => (
      <>
        <AppearanceSection
          selectedTheme={state.profile.themePreference}
          onSelectTheme={(themePreference) => {
            updateProfile({ themePreference })
            setThemeContextOverride(themePreference === "system" ? undefined : themePreference)
          }}
        />
        <MotionSection
          selectedMotionPreference={state.profile.motionPreference}
          onSelectMotionPreference={(motionPreference) => updateProfile({ motionPreference })}
        />
      </>
    ),
  },
  "language": {
    editable: false,
    render: ({ state, tokens, updateProfile }) => (
      <LanguageSection
        currentLanguage={state.profile.language as (typeof LANGUAGE_OPTIONS)[number]}
        onSelectLanguage={(language) => updateProfile({ language })}
        tokens={tokens}
      />
    ),
  },
  "preferences": {
    editable: false,
    render: ({ state, tokens, updateProfile }) => (
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
    ),
  },
  "privacy": {
    editable: false,
    render: ({ state, tokens, updateProfile }) => (
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
    ),
  },
  "security": {
    editable: false,
    render: ({ router, state, tokens, updateFaceId }) => (
      <SecuritySection
        biometricType={state.profile.security.biometricType}
        faceIdEnabled={state.profile.security.faceIdEnabled}
        onChangePassword={() => router.push("/profile/change-password")}
        onToggleFaceId={() => updateFaceId(!state.profile.security.faceIdEnabled)}
        passwordLastChangedAt={state.profile.security.passwordLastChangedAt}
        tokens={tokens}
      />
    ),
  },
  "change-password": {
    editable: false,
    render: () => <ChangePasswordSection />,
  },
  "support": {
    editable: false,
    render: ({ state, tokens }) => <SupportSectionContent state={state} tokens={tokens} />,
  },
}
