/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { AppButton, AppScrollScreen, Pill } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/theme/context"

type SectionKey = "personal" | "preferences" | "employers" | "banking" | "legal"

const sectionMeta: Record<
  SectionKey,
  {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    subtitle: string
  }
> = {
  personal: {
    icon: "person-outline",
    title: "Personal details",
    subtitle: "Keep your contact details and employee profile current.",
  },
  preferences: {
    icon: "sparkles-outline",
    title: "Preferences",
    subtitle: "Choose how the app should look and communicate with you.",
  },
  employers: {
    icon: "briefcase-outline",
    title: "Employers",
    subtitle: "Manage the workplaces linked to your Vesta profile.",
  },
  banking: {
    icon: "card-outline",
    title: "Bank details",
    subtitle: "These details are used for payroll and reimbursements.",
  },
  legal: {
    icon: "shield-checkmark-outline",
    title: "Legal information",
    subtitle: "Private identity details required for compliant employment.",
  },
}

function DetailHeader({ section, onBack }: { section: SectionKey; onBack: () => void }) {
  const tokens = useDesignTokens()
  const meta = sectionMeta[section]

  return (
    <View style={styles.detailHeader}>
      <Pressable
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.backButton, { backgroundColor: tokens.surfaceSecondary }]}
      >
        <Ionicons color={tokens.textPrimary} name="chevron-back-outline" size={18} />
      </Pressable>
      <View style={[styles.headerIcon, { backgroundColor: tokens.accentSoft }]}>
        <Ionicons color={tokens.accent} name={meta.icon} size={23} />
      </View>
      <View style={styles.flex}>
        <Text
          text={meta.title}
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 24, lineHeight: 30 }}
        />
        <Text text={meta.subtitle} size="xs" style={{ color: tokens.textSecondary }} />
      </View>
    </View>
  )
}

function FormSurface({ children }: { children: React.ReactNode }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.formCard, { backgroundColor: tokens.surfaceSecondary }]}>{children}</View>
  )
}

function ThemeOption({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  selected: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeOption,
        {
          backgroundColor: selected ? tokens.accentSoft : tokens.surfaceSecondary,
          borderColor: selected ? tokens.accent : tokens.border,
          opacity: pressed ? 0.74 : 1,
        },
      ]}
    >
      <Ionicons color={selected ? tokens.accent : tokens.textSecondary} name={icon} size={20} />
      <Text
        text={label}
        size="xxs"
        weight="semiBold"
        style={{ color: selected ? tokens.accent : tokens.textPrimary }}
      />
    </Pressable>
  )
}

function EmployerCard({
  employer,
  action,
}: {
  employer: {
    active?: boolean
    city: string
    code: string
    id: string
    name: string
    teamSize: number
    type: string
  }
  action?: React.ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.employerCard, { backgroundColor: tokens.surfaceSecondary }]}>
      <View style={styles.row}>
        <View style={[styles.employerIcon, { backgroundColor: tokens.surfaceSecondary }]}>
          <Ionicons color={tokens.accent} name="business-outline" size={22} />
        </View>
        <View style={styles.flex}>
          <Text
            text={employer.name}
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${employer.type} · ${employer.city} · ${employer.teamSize} people`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Pill
          label={employer.active ? "Active" : action ? "Available" : "Linked"}
          tone={employer.active ? "accent" : "neutral"}
        />
      </View>
      {action ? <View style={styles.employerAction}>{action}</View> : null}
    </View>
  )
}

export function ProfileDetailScreen() {
  const router = useRouter()
  const { section = "employers" } = useLocalSearchParams<{ section: SectionKey }>()
  const tokens = useDesignTokens()
  const { state, updateProfile, switchEmployer, joinEmployer } = useAppSession()
  const { setThemeContextOverride } = useAppTheme()

  const [personalState, setPersonalState] = useState({
    homeCity: state.profile.homeCity,
    nationality: state.profile.nationality,
    phone: state.profile.phone,
  })
  const [bankState, setBankState] = useState(state.profile.bankAccount)
  const [legalState, setLegalState] = useState(state.profile.legal)
  const availableEmployers = useMemo(
    () =>
      state.employerDirectory.filter(
        (employer) => !state.employers.some((existing) => existing.id === employer.id),
      ),
    [state.employerDirectory, state.employers],
  )

  if (section === "personal") {
    return (
      <AppScrollScreen contentContainerStyle={styles.screen}>
        <DetailHeader section="personal" onBack={router.back} />
        <FormSurface>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="PHONE" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              keyboardType="phone-pad"
              onChangeText={(phone) => setPersonalState((current) => ({ ...current, phone }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={personalState.phone}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="HOME CITY" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              onChangeText={(homeCity) => setPersonalState((current) => ({ ...current, homeCity }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={personalState.homeCity}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text
              text="NATIONALITY"
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted }}
            />
            <TextInput
              onChangeText={(nationality) =>
                setPersonalState((current) => ({ ...current, nationality }))
              }
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={personalState.nationality}
            />
          </View>
        </FormSurface>
        <AppButton
          label="Save personal details"
          onPress={() => {
            updateProfile(personalState)
            router.back()
          }}
        />
      </AppScrollScreen>
    )
  }

  if (section === "preferences") {
    return (
      <AppScrollScreen contentContainerStyle={styles.screen}>
        <DetailHeader section="preferences" onBack={router.back} />
        <FormSurface>
          <View style={styles.fieldGroupHeader}>
            <Text text="Theme" size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
          </View>
          <View style={styles.themeGrid}>
            {(
              [
                { icon: "phone-portrait-outline", label: "System", value: "system" },
                { icon: "sunny-outline", label: "Light", value: "light" },
                { icon: "moon-outline", label: "Dark", value: "dark" },
              ] satisfies Array<{
                icon: keyof typeof Ionicons.glyphMap
                label: string
                value: "system" | "light" | "dark"
              }>
            ).map((themePreference) => (
              <ThemeOption
                key={themePreference.value}
                icon={themePreference.icon}
                label={themePreference.label}
                selected={state.profile.themePreference === themePreference.value}
                onPress={() => {
                  updateProfile({
                    themePreference: themePreference.value as "system" | "light" | "dark",
                  })
                  setThemeContextOverride(
                    themePreference.value === "system"
                      ? undefined
                      : (themePreference.value as "light" | "dark"),
                  )
                }}
              />
            ))}
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="LANGUAGE" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              onChangeText={(language) => updateProfile({ language })}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={state.profile.language}
            />
          </View>
        </FormSurface>
      </AppScrollScreen>
    )
  }

  if (section === "banking") {
    return (
      <AppScrollScreen contentContainerStyle={styles.screen}>
        <DetailHeader section="banking" onBack={router.back} />
        <FormSurface>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="IBAN" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              autoCapitalize="characters"
              onChangeText={(iban) => setBankState((current) => ({ ...current, iban }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={bankState.iban}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="BIC" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              autoCapitalize="characters"
              onChangeText={(bic) => setBankState((current) => ({ ...current, bic }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={bankState.bic}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="BANK NAME" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              onChangeText={(bankName) => setBankState((current) => ({ ...current, bankName }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={bankState.bankName}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text
              text="ACCOUNT HOLDER"
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted }}
            />
            <TextInput
              onChangeText={(accountHolder) =>
                setBankState((current) => ({ ...current, accountHolder }))
              }
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={bankState.accountHolder}
            />
          </View>
        </FormSurface>
        <AppButton
          label="Save bank details"
          onPress={() => {
            updateProfile({ bankAccount: bankState })
            router.back()
          }}
        />
      </AppScrollScreen>
    )
  }

  if (section === "legal") {
    return (
      <AppScrollScreen contentContainerStyle={styles.screen}>
        <DetailHeader section="legal" onBack={router.back} />
        <FormSurface>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text
              text="NATIONAL REGISTER NUMBER"
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted }}
            />
            <TextInput
              onChangeText={(nationalRegisterNumber) =>
                setLegalState((current) => ({ ...current, nationalRegisterNumber }))
              }
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={legalState.nationalRegisterNumber}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text text="TAX ID" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
            <TextInput
              onChangeText={(taxId) => setLegalState((current) => ({ ...current, taxId }))}
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={legalState.taxId}
            />
          </View>
          <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
            <Text
              text="SOCIAL SECURITY NUMBER"
              size="xxs"
              weight="medium"
              style={{ color: tokens.textMuted }}
            />
            <TextInput
              onChangeText={(socialSecurityNumber) =>
                setLegalState((current) => ({ ...current, socialSecurityNumber }))
              }
              style={[styles.nativeInput, { color: tokens.textPrimary }]}
              value={legalState.socialSecurityNumber}
            />
          </View>
        </FormSurface>
        <AppButton
          label="Save legal details"
          onPress={() => {
            updateProfile({ legal: legalState })
            router.back()
          }}
        />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen contentContainerStyle={styles.screen}>
      <DetailHeader section="employers" onBack={router.back} />
      <View style={styles.stack}>
        {state.employers.map((employer) => (
          <EmployerCard
            key={employer.id}
            employer={employer}
            action={
              !employer.active ? (
                <AppButton
                  label="Switch employer"
                  onPress={() => switchEmployer(employer.id)}
                  variant="secondary"
                />
              ) : undefined
            }
          />
        ))}
        {availableEmployers.map((employer) => (
          <EmployerCard
            key={employer.id}
            employer={employer}
            action={
              <AppButton
                label={`Link ${employer.code}`}
                onPress={() => joinEmployer(employer.id)}
              />
            }
          />
        ))}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  detailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 4,
  },
  employerAction: {
    paddingTop: 4,
  },
  employerCard: {
    borderRadius: 16,
    gap: 14,
    padding: 16,
  },
  employerIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  fieldGroupHeader: {
    paddingHorizontal: 2,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  formCard: {
    borderRadius: 18,
    gap: 12,
    padding: 16,
  },
  headerIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  inputShell: {
    borderRadius: 14,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nativeInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 24,
    padding: 0,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  screen: {
    gap: 16,
  },
  stack: {
    gap: 14,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  themeOption: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minHeight: 78,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
})
