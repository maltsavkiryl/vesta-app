/* eslint-disable react-native/no-inline-styles */

import { Ionicons } from "@expo/vector-icons"

import { GroupedSection, ListRow, StatusBadge, Text, ToggleSwitch } from "@/ui"
import type { DesignTokens } from "@/ui"

import { LANGUAGE_OPTIONS, SectionFooter } from "./ProfileSectionShared"

export function NotificationPreferencesSection({
  notificationPreferences,
  onToggle,
  tokens,
}: {
  notificationPreferences: Record<string, boolean>
  onToggle: (key: string, enabled: boolean) => void
  tokens: DesignTokens
}) {
  return (
    <GroupedSection title="Notifications">
      {Object.entries(notificationPreferences).map(([key, enabled], index, entries) => (
        <ListRow
          key={key}
          title={key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}
          subtitle={enabled ? "Enabled" : "Muted"}
          isLast={index === entries.length - 1}
          leading={
            <Ionicons
              color={enabled ? tokens.success : tokens.textSecondary}
              name={enabled ? "notifications-outline" : "notifications-off-outline"}
              size={18}
            />
          }
          trailing={
            <ToggleSwitch
              accessibilityLabel={`${key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (value) => value.toUpperCase())} notifications`}
              onChange={() => onToggle(key, enabled)}
              value={enabled}
            />
          }
        />
      ))}
    </GroupedSection>
  )
}

export function LanguageSection({
  currentLanguage,
  onSelectLanguage,
  tokens,
}: {
  currentLanguage: (typeof LANGUAGE_OPTIONS)[number]
  onSelectLanguage: (language: (typeof LANGUAGE_OPTIONS)[number]) => void
  tokens: DesignTokens
}) {
  return (
    <GroupedSection title="Language">
      {LANGUAGE_OPTIONS.map((language, index) => {
        const selected = currentLanguage === language

        return (
          <ListRow
            key={language}
            isLast={index === LANGUAGE_OPTIONS.length - 1}
            title={language}
            subtitle={selected ? "Current language" : undefined}
            onPress={() => onSelectLanguage(language)}
            leading={
              <Ionicons
                color={selected ? tokens.accent : tokens.textSecondary}
                name="language-outline"
                size={18}
              />
            }
            trailing={
              selected ? <Ionicons color={tokens.accent} name="checkmark-circle" size={20} /> : null
            }
          />
        )
      })}
    </GroupedSection>
  )
}

export function SecuritySection({
  biometricType,
  faceIdEnabled,
  onChangePassword,
  onToggleFaceId,
  passwordLastChangedAt,
  tokens,
}: {
  biometricType: string
  faceIdEnabled: boolean
  onChangePassword: () => void
  onToggleFaceId: () => void
  passwordLastChangedAt: string
  tokens: DesignTokens
}) {
  return (
    <>
      <GroupedSection title="Account access">
        <ListRow
          title="Password"
          subtitle={`Last changed ${passwordLastChangedAt}`}
          leading={<Ionicons color={tokens.textSecondary} name="key-outline" size={18} />}
          trailing={
            <Text text="Change" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
          }
          onPress={onChangePassword}
        />
        <ListRow
          isLast
          title={biometricType}
          subtitle={
            faceIdEnabled ? "Enabled for app unlock" : "Use device biometrics to unlock faster"
          }
          leading={
            <Ionicons
              color={faceIdEnabled ? tokens.success : tokens.textSecondary}
              name="scan-outline"
              size={18}
            />
          }
          trailing={
            <ToggleSwitch
              accessibilityLabel={`${biometricType} unlock`}
              onChange={onToggleFaceId}
              value={faceIdEnabled}
            />
          }
        />
      </GroupedSection>
      <SectionFooter text="Biometric unlock stays on this device. Vesta never receives your Face ID data." />
      <GroupedSection title="Sessions">
        <ListRow
          isLast
          title="Signed-in device"
          subtitle="This iPhone"
          leading={
            <Ionicons color={tokens.textSecondary} name="phone-portrait-outline" size={18} />
          }
          trailing={<StatusBadge label="Current" tone="success" />}
        />
      </GroupedSection>
    </>
  )
}

export function PrivacySection({
  analyticsEnabled,
  crashReportsEnabled,
  employerDataSharingEnabled,
  onToggleAnalytics,
  onToggleCrashReports,
  onToggleEmployerSharing,
  tokens,
}: {
  analyticsEnabled: boolean
  crashReportsEnabled: boolean
  employerDataSharingEnabled: boolean
  onToggleAnalytics: () => void
  onToggleCrashReports: () => void
  onToggleEmployerSharing: () => void
  tokens: DesignTokens
}) {
  return (
    <>
      <GroupedSection title="Data sharing">
        <ListRow
          title="Employer data"
          subtitle="Share profile, availability, and documents with linked employers"
          leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel="Employer data sharing"
              onChange={onToggleEmployerSharing}
              value={employerDataSharingEnabled}
            />
          }
        />
        <ListRow
          title="App analytics"
          subtitle="Help Vesta understand which workflows need improvement"
          leading={<Ionicons color={tokens.textSecondary} name="analytics-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel="App analytics"
              onChange={onToggleAnalytics}
              value={analyticsEnabled}
            />
          }
        />
        <ListRow
          isLast
          title="Crash reports"
          subtitle="Send diagnostics when the app fails"
          leading={<Ionicons color={tokens.textSecondary} name="bug-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel="Crash reports"
              onChange={onToggleCrashReports}
              value={crashReportsEnabled}
            />
          }
        />
      </GroupedSection>
      <GroupedSection title="Permissions">
        <ListRow
          title="Document uploads"
          subtitle="Camera and file picker are requested only when uploading"
          leading={<Ionicons color={tokens.textSecondary} name="cloud-upload-outline" size={18} />}
          trailing={<StatusBadge label="On demand" tone="accent" />}
        />
        <ListRow
          isLast
          title="Location"
          subtitle="Not used by this app"
          leading={<Ionicons color={tokens.textSecondary} name="location-outline" size={18} />}
          trailing={<StatusBadge label="Off" tone="neutral" />}
        />
      </GroupedSection>
    </>
  )
}

export function SupportSection({
  onOpenClockHelp,
  onOpenDocsHelp,
  onOpenScheduleHelp,
  onOpenSupportComposer,
  onReportProblem,
  tokens,
}: {
  onOpenClockHelp: () => void
  onOpenDocsHelp: () => void
  onOpenScheduleHelp: () => void
  onOpenSupportComposer: () => void
  onReportProblem: () => void
  tokens: DesignTokens
}) {
  return (
    <>
      <GroupedSection title="Help topics">
        <ListRow
          title="Clocking in and out"
          subtitle="Time tracking, breaks, and corrections"
          leading={<Ionicons color={tokens.textSecondary} name="time-outline" size={18} />}
          onPress={onOpenClockHelp}
        />
        <ListRow
          title="Schedules and availability"
          subtitle="Shift updates, requests, and weekly planning"
          leading={<Ionicons color={tokens.textSecondary} name="calendar-outline" size={18} />}
          onPress={onOpenScheduleHelp}
        />
        <ListRow
          isLast
          title="Documents and payroll"
          subtitle="Uploads, payslips, and employment records"
          leading={<Ionicons color={tokens.textSecondary} name="document-text-outline" size={18} />}
          onPress={onOpenDocsHelp}
        />
      </GroupedSection>
      <GroupedSection title="Contact">
        <ListRow
          title="Message Vesta support"
          subtitle="Average reply within one business day"
          leading={<Ionicons color={tokens.accent} name="chatbubble-ellipses-outline" size={18} />}
          trailing={
            <Text text="Start" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
          }
          onPress={onOpenSupportComposer}
        />
        <ListRow
          isLast
          title="Report a problem"
          subtitle="Send app version and diagnostics"
          leading={<Ionicons color={tokens.textSecondary} name="flag-outline" size={18} />}
          trailing={
            <Text text="Report" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
          }
          onPress={onReportProblem}
        />
      </GroupedSection>
    </>
  )
}

export function BankingVerificationSection({
  hasIban,
  tokens,
}: {
  hasIban: boolean
  tokens: DesignTokens
}) {
  return (
    <GroupedSection title="Verification">
      <ListRow
        isLast
        title="Payroll verification"
        subtitle={hasIban ? "Ready to submit to employer" : "Add an IBAN to verify"}
        leading={<Ionicons color={tokens.textSecondary} name="checkmark-done-outline" size={18} />}
        trailing={
          <StatusBadge
            label={hasIban ? "Ready" : "Missing"}
            tone={hasIban ? "success" : "warning"}
          />
        }
      />
    </GroupedSection>
  )
}

export function LegalPrivacyPreviewSection({
  maskedNationalNumber,
  tokens,
}: {
  maskedNationalNumber: string
  tokens: DesignTokens
}) {
  return (
    <GroupedSection title="Privacy preview">
      <ListRow
        isLast
        title="Masked national number"
        subtitle={maskedNationalNumber}
        leading={<Ionicons color={tokens.textSecondary} name="shield-outline" size={18} />}
        trailing={<StatusBadge label="Hidden" tone="accent" />}
      />
    </GroupedSection>
  )
}
