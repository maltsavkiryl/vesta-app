/* eslint-disable react-native/no-inline-styles */

import { useMemo, useState } from "react"
import {
  Alert,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import type { Employer } from "@/core/models"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  ListRow,
  MetricGrid,
  StatusBadge,
} from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import type { DesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/theme/context"
import { maskSensitiveId } from "@/utils/formatters"

type SectionKey =
  | "personal"
  | "contact"
  | "address"
  | "appearance"
  | "preferences"
  | "language"
  | "employers"
  | "switch-employer"
  | "join-employer"
  | "banking"
  | "legal"
  | "security"
  | "privacy"
  | "support"

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
  "switch-employer": {
    icon: "refresh-outline",
    subtitle: "Select your active employer. Only one employer can be active at a time.",
    title: "Switch employer",
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
    value === "switch-employer" ||
    value === "join-employer" ||
    value === "banking" ||
    value === "legal" ||
    value === "security" ||
    value === "privacy" ||
    value === "support"
    ? value
    : "personal"
}

const LANGUAGE_OPTIONS = ["English (UK)", "Nederlands", "Français"] as const
type JoinMode = "code" | "search"

function DetailHeader({
  isDirty,
  section,
  onBack,
  onSave,
}: {
  isDirty?: boolean
  section: SectionKey
  onBack: () => void
  onSave?: () => void
}) {
  const tokens = useDesignTokens()
  const meta = sectionMeta[section]

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
        style={styles.navButton}
      >
        <Ionicons color={tokens.accent} name="chevron-back" size={28} />
      </Pressable>
      <Text
        text={meta.title}
        numberOfLines={1}
        size="sm"
        weight="semiBold"
        style={[styles.navTitle, { color: tokens.textPrimary }]}
      />
      {onSave ? (
        <Pressable
          accessibilityRole="button"
          disabled={!isDirty}
          hitSlop={12}
          onPress={onSave}
          style={styles.navAction}
        >
          <Text
            text="Save"
            size="sm"
            weight="semiBold"
            style={{ color: isDirty ? tokens.accent : tokens.textMuted }}
          />
        </Pressable>
      ) : (
        <View style={styles.navAction} />
      )}
    </View>
  )
}

function SectionFooter({ text }: { text: string }) {
  const tokens = useDesignTokens()

  return <Text text={text} size="xxs" style={[styles.sectionFooter, { color: tokens.textMuted }]} />
}

function Field({
  label,
  value,
  onChangeText,
  autoCapitalize = "sentences",
  keyboardType = "default",
  multiline,
  placeholder = "Not added",
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  keyboardType?: KeyboardTypeOptions
  multiline?: boolean
  placeholder?: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.fieldShell, { borderBottomColor: tokens.separator }]}>
      <Text
        text={label}
        numberOfLines={1}
        size="xs"
        style={[styles.fieldLabel, { color: tokens.textSecondary }]}
      />
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.textMuted}
        selectionColor={tokens.accent}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          { color: tokens.textPrimary },
        ]}
        value={value}
      />
    </View>
  )
}

function FieldStack({ children }: { children: React.ReactNode }) {
  const tokens = useDesignTokens()

  return <View style={[styles.fieldStack, { backgroundColor: tokens.surface }]}>{children}</View>
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
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeOption,
        {
          backgroundColor: selected ? tokens.accentSoft : tokens.surface,
          borderColor: selected ? tokens.accent : tokens.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Ionicons color={selected ? tokens.accent : tokens.textSecondary} name={icon} size={21} />
      <Text
        text={label}
        size="xxs"
        weight="semiBold"
        style={{ color: selected ? tokens.accent : tokens.textPrimary }}
      />
      {selected ? (
        <Ionicons
          color={tokens.accent}
          name="checkmark-circle"
          size={16}
          style={styles.themeCheck}
        />
      ) : null}
    </Pressable>
  )
}

function getEmployerInitial(name: string) {
  return name.slice(0, 1).toUpperCase()
}

function switchEmployerWithConfirmation({
  employerId,
  employers,
  router,
  switchEmployer,
}: {
  employerId: string
  employers: ReturnType<typeof useAppSession>["state"]["employers"]
  router: ReturnType<typeof useRouter>
  switchEmployer: (employerId: string) => void
}) {
  const employer = employers.find((candidate) => candidate.id === employerId)
  if (!employer || employer.active) return

  Alert.alert(
    `Switch to ${employer.name}?`,
    "Your schedule and time tracking will update accordingly.",
    [
      { style: "cancel", text: "Cancel" },
      {
        text: "Switch",
        onPress: () => {
          switchEmployer(employerId)
          router.replace("/profile/employers")
        },
      },
    ],
  )
}

function EmployerSwitchCard({
  active,
  city,
  name,
  onPress,
  rating,
  tokens,
  type,
}: {
  active: boolean
  city: string
  name: string
  onPress: () => void
  rating: number
  tokens: DesignTokens
  type: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={active}
      onPress={onPress}
      style={({ pressed }) => [
        styles.employerSwitchCard,
        {
          backgroundColor: tokens.surface,
          borderColor: active ? tokens.accent : tokens.transparent,
          opacity: pressed ? 0.72 : 1,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.employerInitial,
          { backgroundColor: active ? tokens.accent : tokens.textPrimary },
        ]}
      >
        <Text
          text={getEmployerInitial(name)}
          size="sm"
          weight="bold"
          style={{ color: tokens.accentForeground }}
        />
      </View>
      <View style={styles.employerSwitchCopy}>
        <Text text={name} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
        <Text text={`${type} - ${city}`} size="xxs" style={{ color: tokens.textSecondary }} />
        <View style={styles.ratingRow}>
          <Ionicons color={tokens.warning} name="star" size={11} />
          <Text text={String(rating)} size="xxs" style={{ color: tokens.textSecondary }} />
        </View>
      </View>
      {active ? (
        <View style={styles.activeStatus}>
          <View style={[styles.activeDot, { backgroundColor: tokens.success }]} />
          <Text text="Active" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
        </View>
      ) : (
        <View
          style={[
            styles.switchPill,
            { backgroundColor: tokens.backgroundMuted, borderColor: tokens.border },
          ]}
        >
          <Text text="Switch" size="xxs" weight="medium" style={{ color: tokens.textSecondary }} />
        </View>
      )}
    </Pressable>
  )
}

function EmployerPreviewCard({ employer, onJoin }: { employer: Employer; onJoin: () => void }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.joinPreviewCard,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.accent,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View style={styles.joinPreviewHeader}>
        <View style={[styles.employerInitial, { backgroundColor: tokens.accent }]}>
          <Text
            text={getEmployerInitial(employer.name)}
            size="sm"
            weight="bold"
            style={{ color: tokens.accentForeground }}
          />
        </View>
        <View style={styles.employerSwitchCopy}>
          <Text
            text={employer.name}
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${employer.type} - ${employer.city}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <View style={styles.ratingRow}>
          <Ionicons color={tokens.warning} name="star" size={13} />
          <Text
            text={String(employer.rating)}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
        </View>
      </View>
      <MetricGrid
        items={[
          { label: "People", value: String(employer.teamSize) },
          { label: "Status", value: "Hiring" },
          { label: "Type", value: employer.type },
        ]}
      />
      <AppButton label="Request to join" onPress={onJoin} />
    </View>
  )
}

export function ProfileDetailScreen() {
  const router = useRouter()
  const { section: rawSection } = useLocalSearchParams<{ section?: string }>()
  const section = getSection(rawSection)
  const tokens = useDesignTokens()
  const { state, joinEmployer, switchEmployer, updateProfile } = useAppSession()
  const { setThemeContextOverride } = useAppTheme()

  const [personalState, setPersonalState] = useState({
    bio: state.profile.bio,
    dateOfBirth: state.profile.dateOfBirth,
    firstName: state.profile.firstName,
    lastName: state.profile.lastName,
    nationality: state.profile.nationality,
    preferredName: state.profile.preferredName,
  })
  const [contactState, setContactState] = useState({
    email: state.profile.email,
    emergencyContact: state.profile.emergencyContact,
    phone: state.profile.phone,
  })
  const [addressState, setAddressState] = useState({
    address: state.profile.address,
    homeCity: state.profile.homeCity,
  })
  const [bankState, setBankState] = useState(state.profile.bankAccount)
  const [legalState, setLegalState] = useState(state.profile.legal)
  const [joinMode, setJoinMode] = useState<JoinMode>("code")
  const [joinCode, setJoinCode] = useState("")
  const [joinSearch, setJoinSearch] = useState("")
  const [selectedJoinEmployerId, setSelectedJoinEmployerId] = useState<string | undefined>()
  const [joinedEmployerId, setJoinedEmployerId] = useState<string | undefined>()

  const availableEmployers = state.employerDirectory.filter(
    (employer) => !state.employers.some((existing) => existing.id === employer.id),
  )
  const normalizedJoinCode = joinCode.trim().toUpperCase()
  const codeMatchedEmployer = availableEmployers.find(
    (employer) => employer.code.toUpperCase() === normalizedJoinCode,
  )
  const searchResults = availableEmployers.filter((employer) => {
    const query = joinSearch.trim().toLowerCase()
    if (!query) return true

    return (
      employer.name.toLowerCase().includes(query) ||
      employer.type.toLowerCase().includes(query) ||
      employer.city.toLowerCase().includes(query) ||
      employer.code.toLowerCase().includes(query)
    )
  })
  const selectedJoinEmployer =
    joinMode === "code"
      ? codeMatchedEmployer
      : availableEmployers.find((employer) => employer.id === selectedJoinEmployerId)
  const joinedEmployer = state.employers.find((employer) => employer.id === joinedEmployerId)

  const dirtyState = useMemo(
    () => ({
      address:
        JSON.stringify(addressState) !==
        JSON.stringify({
          address: state.profile.address,
          homeCity: state.profile.homeCity,
        }),
      banking: JSON.stringify(bankState) !== JSON.stringify(state.profile.bankAccount),
      contact:
        JSON.stringify(contactState) !==
        JSON.stringify({
          email: state.profile.email,
          emergencyContact: state.profile.emergencyContact,
          phone: state.profile.phone,
        }),
      legal: JSON.stringify(legalState) !== JSON.stringify(state.profile.legal),
      personal:
        JSON.stringify(personalState) !==
        JSON.stringify({
          bio: state.profile.bio,
          dateOfBirth: state.profile.dateOfBirth,
          firstName: state.profile.firstName,
          lastName: state.profile.lastName,
          nationality: state.profile.nationality,
          preferredName: state.profile.preferredName,
        }),
    }),
    [addressState, bankState, contactState, legalState, personalState, state.profile],
  )

  const saveCurrentSection = () => {
    if (section === "personal" && dirtyState.personal) {
      updateProfile(personalState)
      router.back()
    }

    if (section === "contact" && dirtyState.contact) {
      updateProfile(contactState)
      router.back()
    }

    if (section === "address" && dirtyState.address) {
      updateProfile(addressState)
      router.back()
    }

    if (section === "banking" && dirtyState.banking) {
      updateProfile({ bankAccount: bankState })
      router.back()
    }

    if (section === "legal" && dirtyState.legal) {
      updateProfile({ legal: legalState })
      router.back()
    }
  }

  const updateFaceId = async (enabled: boolean) => {
    if (!enabled) {
      updateProfile({
        security: {
          ...state.profile.security,
          faceIdEnabled: false,
        },
      })
      return
    }

    try {
      const LocalAuthentication = await import("expo-local-authentication")
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Face ID unavailable",
          "Set up Face ID or another biometric unlock method on this device first.",
        )
        return
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
      const biometricType = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
        ? "Face ID"
        : "Biometric unlock"
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: "Use passcode",
        promptMessage: `Enable ${biometricType}`,
      })

      if (result.success) {
        updateProfile({
          security: {
            ...state.profile.security,
            biometricType,
            faceIdEnabled: true,
          },
        })
      }
    } catch {
      Alert.alert("Face ID unavailable", "Rebuild the development app to enable Face ID.")
    }
  }

  const currentSectionIsDirty =
    section in dirtyState ? dirtyState[section as keyof typeof dirtyState] : false

  return (
    <AppScrollScreen
      variant="grouped"
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={styles.screen}
    >
      <DetailHeader
        section={section}
        isDirty={currentSectionIsDirty}
        onBack={() => {
          if (section === "switch-employer" || section === "join-employer") {
            router.replace("/profile/employers")
            return
          }
          router.back()
        }}
        onSave={
          section === "personal" ||
          section === "contact" ||
          section === "address" ||
          section === "banking" ||
          section === "legal"
            ? saveCurrentSection
            : undefined
        }
      />
      <SectionFooter text={sectionMeta[section].subtitle} />

      {section === "personal" ? (
        <>
          <GroupedSection title="Profile">
            <FieldStack>
              <Field
                label="First name"
                value={personalState.firstName}
                onChangeText={(firstName) =>
                  setPersonalState((current) => ({ ...current, firstName }))
                }
              />
              <Field
                label="Last name"
                value={personalState.lastName}
                onChangeText={(lastName) =>
                  setPersonalState((current) => ({ ...current, lastName }))
                }
              />
              <Field
                label="Preferred name"
                value={personalState.preferredName}
                onChangeText={(preferredName) =>
                  setPersonalState((current) => ({ ...current, preferredName }))
                }
              />
              <Field
                label="Date of birth"
                keyboardType="numbers-and-punctuation"
                placeholder="DD/MM/YYYY"
                value={personalState.dateOfBirth}
                onChangeText={(dateOfBirth) =>
                  setPersonalState((current) => ({ ...current, dateOfBirth }))
                }
              />
              <Field
                label="Nationality"
                value={personalState.nationality}
                onChangeText={(nationality) =>
                  setPersonalState((current) => ({ ...current, nationality }))
                }
              />
            </FieldStack>
          </GroupedSection>
          <GroupedSection title="About">
            <FieldStack>
              <Field
                label="Employee note"
                multiline
                value={personalState.bio}
                onChangeText={(bio) => setPersonalState((current) => ({ ...current, bio }))}
              />
            </FieldStack>
          </GroupedSection>
        </>
      ) : null}

      {section === "contact" ? (
        <>
          <GroupedSection title="Reachability">
            <FieldStack>
              <Field
                autoCapitalize="none"
                keyboardType="email-address"
                label="Email"
                value={contactState.email}
                onChangeText={(email) => setContactState((current) => ({ ...current, email }))}
              />
              <Field
                keyboardType="phone-pad"
                label="Mobile phone"
                value={contactState.phone}
                onChangeText={(phone) => setContactState((current) => ({ ...current, phone }))}
              />
            </FieldStack>
          </GroupedSection>
          <SectionFooter text="Your active employer can use these details for schedule changes and urgent shift updates." />
          <GroupedSection title="Emergency contact">
            <FieldStack>
              <Field
                label="Full name"
                value={contactState.emergencyContact.name}
                onChangeText={(name) =>
                  setContactState((current) => ({
                    ...current,
                    emergencyContact: { ...current.emergencyContact, name },
                  }))
                }
              />
              <Field
                label="Relationship"
                value={contactState.emergencyContact.relationship}
                onChangeText={(relationship) =>
                  setContactState((current) => ({
                    ...current,
                    emergencyContact: { ...current.emergencyContact, relationship },
                  }))
                }
              />
              <Field
                keyboardType="phone-pad"
                label="Phone"
                value={contactState.emergencyContact.phone}
                onChangeText={(phone) =>
                  setContactState((current) => ({
                    ...current,
                    emergencyContact: { ...current.emergencyContact, phone },
                  }))
                }
              />
            </FieldStack>
          </GroupedSection>
        </>
      ) : null}

      {section === "address" ? (
        <>
          <GroupedSection title="Home address">
            <FieldStack>
              <Field
                label="Street and number"
                value={addressState.address.street}
                onChangeText={(street) =>
                  setAddressState((current) => ({
                    ...current,
                    address: { ...current.address, street },
                  }))
                }
              />
              <Field
                keyboardType="number-pad"
                label="Postal code"
                value={addressState.address.postalCode}
                onChangeText={(postalCode) =>
                  setAddressState((current) => ({
                    ...current,
                    address: { ...current.address, postalCode },
                  }))
                }
              />
              <Field
                label="City"
                value={addressState.address.city}
                onChangeText={(city) =>
                  setAddressState((current) => ({
                    ...current,
                    address: { ...current.address, city },
                    homeCity: city,
                  }))
                }
              />
              <Field
                label="Country"
                value={addressState.address.country}
                onChangeText={(country) =>
                  setAddressState((current) => ({
                    ...current,
                    address: { ...current.address, country },
                  }))
                }
              />
            </FieldStack>
          </GroupedSection>
          <SectionFooter text="This address is used for employment records, payroll correspondence, and legally required mail." />
        </>
      ) : null}

      {section === "appearance" ? (
        <>
          <GroupedSection title="Appearance">
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
                    updateProfile({ themePreference: themePreference.value })
                    setThemeContextOverride(
                      themePreference.value === "system" ? undefined : themePreference.value,
                    )
                  }}
                />
              ))}
            </View>
          </GroupedSection>
        </>
      ) : null}

      {section === "preferences" ? (
        <>
          <GroupedSection title="Notifications">
            {Object.entries(state.profile.notificationPreferences).map(
              ([key, enabled], index, entries) => {
                const preferenceKey = key as keyof typeof state.profile.notificationPreferences

                return (
                  <ListRow
                    key={key}
                    title={key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (value) => value.toUpperCase())}
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
                      <Switch
                        accessibilityLabel={`${key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (value) => value.toUpperCase())} notifications`}
                        ios_backgroundColor={tokens.surfaceTertiary}
                        onValueChange={(nextEnabled) =>
                          updateProfile({
                            notificationPreferences: {
                              ...state.profile.notificationPreferences,
                              [preferenceKey]: nextEnabled,
                            },
                          })
                        }
                        thumbColor="#FFFFFF"
                        trackColor={{
                          false: tokens.surfaceTertiary,
                          true: tokens.success,
                        }}
                        value={enabled}
                      />
                    }
                  />
                )
              },
            )}
          </GroupedSection>
        </>
      ) : null}

      {section === "language" ? (
        <>
          <GroupedSection title="Language">
            {LANGUAGE_OPTIONS.map((language, index) => {
              const selected = state.profile.language === language

              return (
                <ListRow
                  key={language}
                  isLast={index === LANGUAGE_OPTIONS.length - 1}
                  title={language}
                  subtitle={selected ? "Current language" : undefined}
                  onPress={() => updateProfile({ language })}
                  leading={
                    <Ionicons
                      color={selected ? tokens.accent : tokens.textSecondary}
                      name="language-outline"
                      size={18}
                    />
                  }
                  trailing={
                    selected ? (
                      <Ionicons color={tokens.accent} name="checkmark-circle" size={20} />
                    ) : null
                  }
                />
              )
            })}
          </GroupedSection>
        </>
      ) : null}

      {section === "employers" ? (
        <>
          <GroupedSection
            actionLabel="Join"
            title="Linked workplaces"
            onAction={() => router.push("/profile/join-employer")}
          >
            {state.employers.map((employer, index) => (
              <ListRow
                key={employer.id}
                title={employer.name}
                subtitle={`${employer.type} - ${employer.city} - ${employer.teamSize} people`}
                isLast={index === state.employers.length - 1}
                onPress={() =>
                  switchEmployerWithConfirmation({
                    employerId: employer.id,
                    employers: state.employers,
                    router,
                    switchEmployer,
                  })
                }
                leading={<Ionicons color={tokens.accent} name="business-outline" size={18} />}
                trailing={
                  <StatusBadge
                    label={employer.active ? "Active" : "Linked"}
                    tone={employer.active ? "success" : "neutral"}
                  />
                }
              />
            ))}
          </GroupedSection>

          {availableEmployers.length > 0 ? (
            <GroupedSection
              actionLabel="Search"
              title="Available invitations"
              onAction={() => router.push("/profile/join-employer")}
            >
              {availableEmployers.map((employer, index) => (
                <ListRow
                  key={employer.id}
                  title={employer.name}
                  subtitle={`${employer.type} - ${employer.city}`}
                  isLast={index === availableEmployers.length - 1}
                  onPress={() => joinEmployer(employer.id)}
                  leading={
                    <Ionicons color={tokens.textSecondary} name="add-circle-outline" size={18} />
                  }
                  trailing={
                    <Text
                      text="Join"
                      size="xs"
                      weight="semiBold"
                      style={{ color: tokens.accent }}
                    />
                  }
                />
              ))}
            </GroupedSection>
          ) : null}
        </>
      ) : null}

      {section === "switch-employer" ? (
        <View style={styles.employerSwitchStack}>
          {state.employers.map((employer) => (
            <EmployerSwitchCard
              key={employer.id}
              active={Boolean(employer.active)}
              city={employer.city}
              name={employer.name}
              rating={employer.rating}
              tokens={tokens}
              type={employer.type}
              onPress={() =>
                switchEmployerWithConfirmation({
                  employerId: employer.id,
                  employers: state.employers,
                  router,
                  switchEmployer,
                })
              }
            />
          ))}
        </View>
      ) : null}

      {section === "join-employer" ? (
        <>
          <View style={[styles.joinModeControl, { backgroundColor: tokens.surfaceSecondary }]}>
            {(
              [
                { label: "Invite code", value: "code" },
                { label: "Search", value: "search" },
              ] satisfies Array<{ label: string; value: JoinMode }>
            ).map((mode) => {
              const selected = joinMode === mode.value

              return (
                <Pressable
                  key={mode.value}
                  accessibilityRole="button"
                  onPress={() => {
                    setJoinMode(mode.value)
                    setJoinCode("")
                    setJoinSearch("")
                    setSelectedJoinEmployerId(undefined)
                    setJoinedEmployerId(undefined)
                  }}
                  style={[
                    styles.joinModeButton,
                    {
                      backgroundColor: selected ? tokens.surface : tokens.transparent,
                      shadowColor: tokens.shadow,
                      shadowOpacity: selected ? 0.1 : 0,
                    },
                  ]}
                >
                  <Text
                    text={mode.label}
                    size="xxs"
                    weight={selected ? "semiBold" : "normal"}
                    style={{ color: selected ? tokens.textPrimary : tokens.textSecondary }}
                  />
                </Pressable>
              )
            })}
          </View>

          {joinMode === "code" ? (
            <GroupedSection title="Invite code">
              <View style={styles.joinCodeContent}>
                <Text
                  text="Ask your manager for the workplace invite code."
                  size="xs"
                  style={{ color: tokens.textSecondary, textAlign: "center" }}
                />
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  onChangeText={(value) => {
                    setJoinCode(value.toUpperCase())
                    setJoinedEmployerId(undefined)
                  }}
                  placeholder={availableEmployers[0]?.code ?? "ABC123"}
                  placeholderTextColor={tokens.textMuted}
                  selectionColor={tokens.accent}
                  style={[
                    styles.joinCodeInput,
                    {
                      backgroundColor: tokens.backgroundMuted,
                      color: tokens.textPrimary,
                    },
                  ]}
                  value={joinCode}
                />
                <Text
                  text={
                    joinCode.length === 0
                      ? "Enter a 6-character code"
                      : joinCode.length < 6
                        ? `${6 - joinCode.length} more`
                        : codeMatchedEmployer
                          ? `Found: ${codeMatchedEmployer.name}`
                          : "No employer found for this code"
                  }
                  size="xxs"
                  style={{
                    color:
                      joinCode.length === 6 && codeMatchedEmployer
                        ? tokens.success
                        : tokens.textMuted,
                    textAlign: "center",
                  }}
                />
              </View>
            </GroupedSection>
          ) : null}

          {joinMode === "search" ? (
            <>
              <View style={[styles.searchShell, { backgroundColor: tokens.surface }]}>
                <Ionicons color={tokens.textMuted} name="search-outline" size={16} />
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => {
                    setJoinSearch(value)
                    setSelectedJoinEmployerId(undefined)
                    setJoinedEmployerId(undefined)
                  }}
                  placeholder="Search by name, type or city"
                  placeholderTextColor={tokens.textMuted}
                  selectionColor={tokens.accent}
                  style={[styles.searchInput, { color: tokens.textPrimary }]}
                  value={joinSearch}
                />
              </View>

              <GroupedSection title="Results">
                {searchResults.length > 0 ? (
                  searchResults.map((employer, index) => {
                    const selected = selectedJoinEmployerId === employer.id

                    return (
                      <ListRow
                        key={employer.id}
                        title={employer.name}
                        subtitle={`${employer.type} - ${employer.city}`}
                        isLast={index === searchResults.length - 1}
                        onPress={() => {
                          setSelectedJoinEmployerId(employer.id)
                          setJoinedEmployerId(undefined)
                        }}
                        leading={
                          <View
                            style={[
                              styles.searchInitial,
                              { backgroundColor: selected ? tokens.accent : tokens.textPrimary },
                            ]}
                          >
                            <Text
                              text={getEmployerInitial(employer.name)}
                              size="xxs"
                              weight="bold"
                              style={{ color: tokens.accentForeground }}
                            />
                          </View>
                        }
                        trailing={
                          selected ? (
                            <Ionicons color={tokens.accent} name="checkmark-circle" size={20} />
                          ) : (
                            <View style={styles.searchMeta}>
                              <View style={styles.ratingRow}>
                                <Ionicons color={tokens.warning} name="star" size={11} />
                                <Text
                                  text={String(employer.rating)}
                                  size="xxs"
                                  style={{ color: tokens.textSecondary }}
                                />
                              </View>
                              <Text
                                text={`${employer.teamSize} staff`}
                                size="xxs"
                                style={{ color: tokens.textMuted }}
                              />
                            </View>
                          )
                        }
                      />
                    )
                  })
                ) : (
                  <View style={styles.emptyJoinState}>
                    <Text
                      text={`No results${joinSearch ? ` for "${joinSearch}"` : ""}`}
                      size="xs"
                      weight="medium"
                      style={{ color: tokens.textPrimary, textAlign: "center" }}
                    />
                    <Text
                      text="Try a different search term or ask your manager for an invite code."
                      size="xxs"
                      style={{ color: tokens.textMuted, textAlign: "center" }}
                    />
                  </View>
                )}
              </GroupedSection>
            </>
          ) : null}

          {selectedJoinEmployer && !joinedEmployer ? (
            <EmployerPreviewCard
              employer={selectedJoinEmployer}
              onJoin={() => {
                joinEmployer(selectedJoinEmployer.id)
                setJoinedEmployerId(selectedJoinEmployer.id)
              }}
            />
          ) : null}

          {joinedEmployer ? (
            <View
              style={[
                styles.joinSuccess,
                { backgroundColor: tokens.successSoft, borderColor: `${tokens.success}33` },
              ]}
            >
              <View style={[styles.joinSuccessIcon, { backgroundColor: tokens.successSoft }]}>
                <Ionicons color={tokens.success} name="checkmark-circle-outline" size={34} />
              </View>
              <Text
                text="Request sent"
                size="sm"
                weight="bold"
                style={{ color: tokens.textPrimary, textAlign: "center" }}
              />
              <Text
                text={`You'll be notified when ${joinedEmployer.name} approves your request.`}
                size="xs"
                style={{ color: tokens.textSecondary, textAlign: "center" }}
              />
              <AppButton
                label="Done"
                variant="secondary"
                onPress={() => router.replace("/profile/employers")}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {section === "security" ? (
        <>
          <GroupedSection title="Account access">
            <ListRow
              title="Password"
              subtitle={`Last changed ${state.profile.security.passwordLastChangedAt}`}
              leading={<Ionicons color={tokens.textSecondary} name="key-outline" size={18} />}
              trailing={
                <Text text="Change" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
              }
              onPress={() =>
                Alert.alert(
                  "Change password",
                  "Password changes will be available when production authentication is connected.",
                )
              }
            />
            <ListRow
              isLast
              title={state.profile.security.biometricType}
              subtitle={
                state.profile.security.faceIdEnabled
                  ? "Enabled for app unlock"
                  : "Use device biometrics to unlock faster"
              }
              leading={
                <Ionicons
                  color={
                    state.profile.security.faceIdEnabled ? tokens.success : tokens.textSecondary
                  }
                  name="scan-outline"
                  size={18}
                />
              }
              trailing={
                <Switch
                  accessibilityLabel={`${state.profile.security.biometricType} unlock`}
                  ios_backgroundColor={tokens.surfaceTertiary}
                  onValueChange={updateFaceId}
                  thumbColor="#FFFFFF"
                  trackColor={{
                    false: tokens.surfaceTertiary,
                    true: tokens.success,
                  }}
                  value={state.profile.security.faceIdEnabled}
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
      ) : null}

      {section === "privacy" ? (
        <>
          <GroupedSection title="Data sharing">
            <ListRow
              title="Employer data"
              subtitle="Share profile, availability, and documents with linked employers"
              leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={18} />}
              trailing={
                <Switch
                  accessibilityLabel="Employer data sharing"
                  ios_backgroundColor={tokens.surfaceTertiary}
                  onValueChange={(employerDataSharingEnabled) =>
                    updateProfile({
                      privacy: {
                        ...state.profile.privacy,
                        employerDataSharingEnabled,
                      },
                    })
                  }
                  thumbColor="#FFFFFF"
                  trackColor={{
                    false: tokens.surfaceTertiary,
                    true: tokens.success,
                  }}
                  value={state.profile.privacy.employerDataSharingEnabled}
                />
              }
            />
            <ListRow
              title="App analytics"
              subtitle="Help Vesta understand which workflows need improvement"
              leading={<Ionicons color={tokens.textSecondary} name="analytics-outline" size={18} />}
              trailing={
                <Switch
                  accessibilityLabel="App analytics"
                  ios_backgroundColor={tokens.surfaceTertiary}
                  onValueChange={(analyticsEnabled) =>
                    updateProfile({
                      privacy: {
                        ...state.profile.privacy,
                        analyticsEnabled,
                      },
                    })
                  }
                  thumbColor="#FFFFFF"
                  trackColor={{
                    false: tokens.surfaceTertiary,
                    true: tokens.success,
                  }}
                  value={state.profile.privacy.analyticsEnabled}
                />
              }
            />
            <ListRow
              isLast
              title="Crash reports"
              subtitle="Send diagnostics when the app fails"
              leading={<Ionicons color={tokens.textSecondary} name="bug-outline" size={18} />}
              trailing={
                <Switch
                  accessibilityLabel="Crash reports"
                  ios_backgroundColor={tokens.surfaceTertiary}
                  onValueChange={(crashReportsEnabled) =>
                    updateProfile({
                      privacy: {
                        ...state.profile.privacy,
                        crashReportsEnabled,
                      },
                    })
                  }
                  thumbColor="#FFFFFF"
                  trackColor={{
                    false: tokens.surfaceTertiary,
                    true: tokens.success,
                  }}
                  value={state.profile.privacy.crashReportsEnabled}
                />
              }
            />
          </GroupedSection>
          <GroupedSection title="Permissions">
            <ListRow
              title="Document uploads"
              subtitle="Camera and file picker are requested only when uploading"
              leading={
                <Ionicons color={tokens.textSecondary} name="cloud-upload-outline" size={18} />
              }
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
      ) : null}

      {section === "support" ? (
        <>
          <GroupedSection title="Help topics">
            <ListRow
              title="Clocking in and out"
              subtitle="Time tracking, breaks, and corrections"
              leading={<Ionicons color={tokens.textSecondary} name="time-outline" size={18} />}
              onPress={() =>
                Alert.alert(
                  "Clocking in and out",
                  "Use the Time tab to start work, begin breaks, and confirm clock-out totals.",
                )
              }
            />
            <ListRow
              title="Schedules and availability"
              subtitle="Shift updates, requests, and weekly planning"
              leading={<Ionicons color={tokens.textSecondary} name="calendar-outline" size={18} />}
              onPress={() =>
                Alert.alert(
                  "Schedules and availability",
                  "Use Schedule to review shifts, set availability, and request changes.",
                )
              }
            />
            <ListRow
              isLast
              title="Documents and payroll"
              subtitle="Uploads, payslips, and employment records"
              leading={
                <Ionicons color={tokens.textSecondary} name="document-text-outline" size={18} />
              }
              onPress={() =>
                Alert.alert(
                  "Documents and payroll",
                  "Use Documents to upload missing files, review contracts, and open payslips.",
                )
              }
            />
          </GroupedSection>
          <GroupedSection title="Contact">
            <ListRow
              title="Message Vesta support"
              subtitle="Average reply within one business day"
              leading={
                <Ionicons color={tokens.accent} name="chatbubble-ellipses-outline" size={18} />
              }
              trailing={
                <Text text="Start" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
              }
              onPress={() =>
                Alert.alert("Support request", "A support message composer will open here.")
              }
            />
            <ListRow
              isLast
              title="Report a problem"
              subtitle="Send app version and diagnostics"
              leading={<Ionicons color={tokens.textSecondary} name="flag-outline" size={18} />}
              trailing={
                <Text text="Report" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
              }
              onPress={() =>
                Alert.alert("Report a problem", "A diagnostics report will be prepared here.")
              }
            />
          </GroupedSection>
        </>
      ) : null}

      {section === "banking" ? (
        <>
          <GroupedSection title="Payroll account">
            <FieldStack>
              <Field
                autoCapitalize="characters"
                label="IBAN"
                value={bankState.iban}
                onChangeText={(iban) => setBankState((current) => ({ ...current, iban }))}
              />
              <Field
                autoCapitalize="characters"
                label="BIC"
                value={bankState.bic}
                onChangeText={(bic) => setBankState((current) => ({ ...current, bic }))}
              />
              <Field
                label="Bank name"
                value={bankState.bankName}
                onChangeText={(bankName) => setBankState((current) => ({ ...current, bankName }))}
              />
              <Field
                label="Account holder"
                value={bankState.accountHolder}
                onChangeText={(accountHolder) =>
                  setBankState((current) => ({ ...current, accountHolder }))
                }
              />
            </FieldStack>
          </GroupedSection>
          <SectionFooter text="Bank details are masked in the app and only used by payroll once your employer verifies them." />
          <GroupedSection title="Verification">
            <ListRow
              isLast
              title="Payroll verification"
              subtitle={bankState.iban ? "Ready to submit to employer" : "Add an IBAN to verify"}
              leading={
                <Ionicons color={tokens.textSecondary} name="checkmark-done-outline" size={18} />
              }
              trailing={
                <StatusBadge
                  label={bankState.iban ? "Ready" : "Missing"}
                  tone={bankState.iban ? "success" : "warning"}
                />
              }
            />
          </GroupedSection>
        </>
      ) : null}

      {section === "legal" ? (
        <>
          <GroupedSection title="Identity">
            <FieldStack>
              <Field
                keyboardType="numbers-and-punctuation"
                label="National register number"
                value={legalState.nationalRegisterNumber}
                onChangeText={(nationalRegisterNumber) =>
                  setLegalState((current) => ({ ...current, nationalRegisterNumber }))
                }
              />
              <Field
                autoCapitalize="characters"
                label="Tax ID"
                value={legalState.taxId}
                onChangeText={(taxId) => setLegalState((current) => ({ ...current, taxId }))}
              />
              <Field
                keyboardType="numbers-and-punctuation"
                label="Social security"
                value={legalState.socialSecurityNumber}
                onChangeText={(socialSecurityNumber) =>
                  setLegalState((current) => ({ ...current, socialSecurityNumber }))
                }
              />
            </FieldStack>
          </GroupedSection>
          <SectionFooter text="Identity numbers stay hidden after saving. Vesta only exposes what payroll and employment compliance require." />
          <GroupedSection title="Employment compliance">
            <FieldStack>
              <Field
                label="Work permit status"
                value={legalState.workPermitStatus}
                onChangeText={(workPermitStatus) =>
                  setLegalState((current) => ({ ...current, workPermitStatus }))
                }
              />
              <Field
                label="Payroll status"
                value={legalState.payrollStatus}
                onChangeText={(payrollStatus) =>
                  setLegalState((current) => ({ ...current, payrollStatus }))
                }
              />
            </FieldStack>
          </GroupedSection>
          <GroupedSection title="Privacy preview">
            <ListRow
              isLast
              title="Masked national number"
              subtitle={maskSensitiveId(legalState.nationalRegisterNumber)}
              leading={<Ionicons color={tokens.textSecondary} name="shield-outline" size={18} />}
              trailing={<StatusBadge label="Hidden" tone="accent" />}
            />
          </GroupedSection>
        </>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  activeDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  employerInitial: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  employerSwitchCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 13,
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  employerSwitchCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  employerSwitchStack: {
    gap: 10,
  },
  emptyJoinState: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  fieldLabel: {
    flexShrink: 0,
    width: 128,
  },
  fieldShell: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fieldStack: {
    borderCurve: "continuous",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 30,
    padding: 0,
  },
  joinCodeContent: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  joinCodeInput: {
    borderCurve: "continuous",
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    minHeight: 54,
    paddingHorizontal: 18,
    textAlign: "center",
    width: "100%",
  },
  joinModeButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 32,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  joinModeControl: {
    borderCurve: "continuous",
    borderRadius: 10,
    flexDirection: "row",
    gap: 2,
    padding: 2,
  },
  joinPreviewCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  joinPreviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  joinSuccess: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  joinSuccessIcon: {
    alignItems: "center",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  multilineInput: {
    minHeight: 86,
    paddingTop: 4,
    textAlignVertical: "top",
  },
  navAction: {
    alignItems: "flex-end",
    minWidth: 54,
  },
  navButton: {
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: 54,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  screen: {
    gap: 12,
    paddingHorizontal: 16,
  },
  searchInitial: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 24,
    padding: 0,
  },
  searchMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
  searchShell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  sectionFooter: {
    paddingHorizontal: 4,
  },
  switchPill: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  themeCheck: {
    position: "absolute",
    right: 8,
    top: 8,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  themeOption: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 84,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
})
