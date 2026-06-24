import { useState } from "react"
import { StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { type AppLocale, mapToSupportedLocale } from "@/i18n"
import { translate } from "@/i18n/translate"
import {
  AppButton,
  Banner,
  GroupedSection,
  ListRow,
  SelectionIndicator,
  StatusBadge,
  Text,
  TextField,
  ToggleSwitch,
  useDesignTokens,
} from "@/ui"
import type { DesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

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
    <GroupedSection title={translate("profile:settings.notifications")}>
      {Object.entries(notificationPreferences).map(([key, enabled], index, entries) => (
        <ListRow
          key={key}
          title={key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}
          subtitle={
            enabled ? translate("profile:settings.enabled") : translate("profile:settings.muted")
          }
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
  currentLanguage: string
  onSelectLanguage: (language: AppLocale) => void
  tokens: DesignTokens
}) {
  const activeLocale = mapToSupportedLocale(currentLanguage)

  return (
    <GroupedSection title={translate("profile:settings.language")}>
      {LANGUAGE_OPTIONS.map((language, index) => {
        const selected = activeLocale === language.value

        return (
          <ListRow
            key={language.value}
            isLast={index === LANGUAGE_OPTIONS.length - 1}
            title={language.label}
            onPress={() => onSelectLanguage(language.value)}
            leading={
              <Ionicons
                color={selected ? tokens.accent : tokens.textSecondary}
                name="language-outline"
                size={18}
              />
            }
            trailing={selected ? <SelectionIndicator /> : null}
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
      <GroupedSection title={translate("profile:settings.accountAccess")}>
        <ListRow
          title={translate("profile:settings.password")}
          subtitle={translate("profile:settings.lastChanged", { date: passwordLastChangedAt })}
          leading={<Ionicons color={tokens.textSecondary} name="key-outline" size={18} />}
          trailing={
            <Text
              text={translate("profile:settings.change")}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accent }}
            />
          }
          onPress={onChangePassword}
        />
        <ListRow
          isLast
          title={biometricType}
          subtitle={
            faceIdEnabled
              ? translate("profile:settings.faceIdOn")
              : translate("profile:settings.faceIdOff")
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
      <SectionFooter text={translate("profile:settings.biometricHint")} />
      <GroupedSection title={translate("profile:settings.sessions")}>
        <ListRow
          isLast
          title={translate("profile:settings.signedInDevice")}
          subtitle={translate("profile:settings.thisDevice")}
          leading={
            <Ionicons color={tokens.textSecondary} name="phone-portrait-outline" size={18} />
          }
          trailing={<StatusBadge label={translate("profile:settings.current")} tone="success" />}
        />
      </GroupedSection>
    </>
  )
}

export function ChangePasswordSection() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { changePassword } = useAuthActions()
  const [currentPassword, setCurrentPassword] = useState("")
  const [nextPassword, setNextPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)

  const canSubmit = Boolean(currentPassword && nextPassword && confirmPassword) && !isSaving

  const handleSubmit = async () => {
    if (nextPassword.length < 6) {
      fireHaptic("warning")
      setError(translate("auth:validation.passwordMin6"))
      return
    }

    if (nextPassword !== confirmPassword) {
      fireHaptic("warning")
      setError(translate("auth:validation.passwordsMismatchNew"))
      return
    }

    setIsSaving(true)
    setError(undefined)
    const result = await changePassword({ currentPassword, nextPassword })
    setIsSaving(false)

    if (!result.ok) {
      fireHaptic("error")
      setError(result.error.message)
      return
    }

    fireHaptic("success")
    router.back()
  }

  return (
    <>
      <GroupedSection title={translate("profile:settings.updatePassword")}>
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.field}
          label={translate("profile:settings.currentPassword")}
          onChangeText={setCurrentPassword}
          secureTextEntry
          textContentType="password"
          value={currentPassword}
          variant="muted"
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.field}
          label={translate("profile:settings.newPassword")}
          onChangeText={setNextPassword}
          secureTextEntry
          textContentType="newPassword"
          value={nextPassword}
          variant="muted"
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.field}
          label={translate("profile:settings.confirmNewPassword")}
          onChangeText={setConfirmPassword}
          onSubmitEditing={() => {
            if (canSubmit) {
              void handleSubmit()
            }
          }}
          returnKeyType="done"
          secureTextEntry
          textContentType="password"
          value={confirmPassword}
          variant="muted"
        />
      </GroupedSection>
      {error ? (
        <Banner tone="danger">
          <Text text={error} size="xxs" style={{ color: tokens.danger }} />
        </Banner>
      ) : null}
      <AppButton
        disabled={!canSubmit}
        fullWidth
        label={
          isSaving
            ? translate("profile:settings.saving")
            : translate("profile:settings.savePassword")
        }
        onPress={() => {
          void handleSubmit()
        }}
        pressHaptic="none"
      />
      <SectionFooter text={translate("profile:settings.passwordHint")} />
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
      <GroupedSection title={translate("profile:settings.dataSharing")}>
        <ListRow
          title={translate("profile:settings.employerData")}
          subtitle={translate("profile:settings.employerDataDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel={translate("profile:settings.employerDataA11y")}
              onChange={onToggleEmployerSharing}
              value={employerDataSharingEnabled}
            />
          }
        />
        <ListRow
          title={translate("profile:settings.appAnalytics")}
          subtitle={translate("profile:settings.appAnalyticsDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="analytics-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel={translate("profile:settings.appAnalytics")}
              onChange={onToggleAnalytics}
              value={analyticsEnabled}
            />
          }
        />
        <ListRow
          isLast
          title={translate("profile:settings.crashReports")}
          subtitle={translate("profile:settings.crashReportsDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="bug-outline" size={18} />}
          trailing={
            <ToggleSwitch
              accessibilityLabel={translate("profile:settings.crashReports")}
              onChange={onToggleCrashReports}
              value={crashReportsEnabled}
            />
          }
        />
      </GroupedSection>
      <GroupedSection title={translate("profile:settings.permissions")}>
        <ListRow
          title={translate("profile:settings.documentUploads")}
          subtitle={translate("profile:settings.documentUploadsDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="cloud-upload-outline" size={18} />}
          trailing={<StatusBadge label={translate("profile:settings.onDemand")} tone="accent" />}
        />
        <ListRow
          isLast
          title={translate("profile:settings.location")}
          subtitle={translate("profile:settings.locationDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="location-outline" size={18} />}
          trailing={<StatusBadge label={translate("profile:settings.off")} tone="neutral" />}
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
      <GroupedSection title={translate("profile:settings.helpTopics")}>
        <ListRow
          title={translate("profile:settings.helpClocking")}
          subtitle={translate("profile:settings.helpClockingDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="time-outline" size={18} />}
          onPress={onOpenClockHelp}
        />
        <ListRow
          title={translate("profile:settings.helpSchedules")}
          subtitle={translate("profile:settings.helpSchedulesDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="calendar-outline" size={18} />}
          onPress={onOpenScheduleHelp}
        />
        <ListRow
          isLast
          title={translate("profile:settings.helpDocuments")}
          subtitle={translate("profile:settings.helpDocumentsDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="document-text-outline" size={18} />}
          onPress={onOpenDocsHelp}
        />
      </GroupedSection>
      <GroupedSection title={translate("profile:settings.contact")}>
        <ListRow
          title={translate("profile:settings.messageSupport")}
          subtitle={translate("profile:settings.messageSupportDesc")}
          leading={<Ionicons color={tokens.accent} name="chatbubble-ellipses-outline" size={18} />}
          trailing={
            <Text
              text={translate("profile:settings.start")}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accent }}
            />
          }
          onPress={onOpenSupportComposer}
        />
        <ListRow
          isLast
          title={translate("profile:settings.reportProblem")}
          subtitle={translate("profile:settings.reportProblemDesc")}
          leading={<Ionicons color={tokens.textSecondary} name="flag-outline" size={18} />}
          trailing={
            <Text
              text={translate("profile:settings.report")}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accent }}
            />
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
    <GroupedSection title={translate("profile:settings.verification")}>
      <ListRow
        isLast
        title={translate("profile:settings.payrollVerification")}
        subtitle={
          hasIban
            ? translate("profile:settings.payrollReadyDesc")
            : translate("profile:settings.payrollMissingDesc")
        }
        leading={<Ionicons color={tokens.textSecondary} name="checkmark-done-outline" size={18} />}
        trailing={
          <StatusBadge
            label={
              hasIban ? translate("profile:settings.ready") : translate("profile:settings.missing")
            }
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
    <GroupedSection title={translate("profile:settings.privacyPreview")}>
      <ListRow
        isLast
        title={translate("profile:settings.maskedNationalNumber")}
        subtitle={maskedNationalNumber}
        leading={<Ionicons color={tokens.textSecondary} name="shield-outline" size={18} />}
        trailing={<StatusBadge label={translate("profile:settings.hidden")} tone="accent" />}
      />
    </GroupedSection>
  )
}

const styles = StyleSheet.create({
  field: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
})
