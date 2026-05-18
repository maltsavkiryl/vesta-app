/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo } from "react"
import { Alert, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { createInitialState } from "@/core/mockState"
import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import {
  AppScrollScreen,
  ListCard,
  ListCardItem,
  MetricGrid,
  Pill,
  SectionBlock,
  SurfaceCard,
  Text,
  useAppTheme,
  useDesignTokens,
} from "@/ui"
import type { DesignTokens } from "@/ui"
import { maskIban } from "@/utils/formatters"

type ProfileSection = "personal" | "employment" | "settings" | "support"
type ProfileRoute =
  | "/profile/personal"
  | "/profile/contact"
  | "/profile/address"
  | "/profile/appearance"
  | "/profile/preferences"
  | "/profile/language"
  | "/profile/employers"
  | "/profile/switch-employer"
  | "/profile/banking"
  | "/profile/legal"
  | "/profile/security"
  | "/profile/privacy"
  | "/profile/support"

interface ProfileRowItem {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value?: string
  badge?: string
  route?: ProfileRoute
  destructive?: boolean
  showChevron?: boolean
  onPress?: () => void
  rightAccessory?: React.ReactNode
}

const SECTION_TITLES: Record<ProfileSection, string> = {
  personal: "Personal",
  employment: "Employment",
  settings: "Settings",
  support: "Support",
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase()
}

function capitalize(value?: string) {
  if (!value) return "Waiter"
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}

function formatWorkedHours(hours: number) {
  return `${Math.round(hours)}h`
}

function ProfileAvatar({ initials }: { initials: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.avatarFrame}>
      <View
        style={[
          styles.avatarProgressRing,
          { borderColor: tokens.accent, backgroundColor: tokens.surface },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: tokens.textPrimary }]}>
          <Text text={initials} size="lg" weight="semiBold" style={{ color: tokens.surface }} />
        </View>
      </View>
      <View
        style={[
          styles.cameraButton,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <Ionicons color={tokens.textPrimary} name="camera-outline" size={12} />
      </View>
    </View>
  )
}

function ProfileHeader({
  email,
  employerName,
  fullName,
  initials,
  role,
}: {
  email: string
  employerName: string
  fullName: string
  initials: string
  role: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.profileHeader}>
      <ProfileAvatar initials={initials} />
      <Text text={fullName} size="xl" weight="bold" style={{ color: tokens.textPrimary }} />
      <Text text={email} size="xs" style={{ color: tokens.textSecondary }} />
      <View style={[styles.employerPill, { backgroundColor: tokens.accentSoft }]}>
        <View style={[styles.statusDot, { backgroundColor: tokens.success }]} />
        <Text
          text={`${employerName} · ${role}`}
          numberOfLines={1}
          size="xxs"
          weight="medium"
          style={{ color: tokens.accent }}
        />
      </View>
    </View>
  )
}

function StatCard({
  stats,
}: {
  stats: Array<{
    label: string
    value: string
  }>
}) {
  return <MetricGrid items={stats} />
}

function CompletenessCard({ progress }: { progress: number }) {
  const tokens = useDesignTokens()

  return (
    <SurfaceCard style={styles.completenessCard}>
      <View style={styles.progressHeader}>
        <Text
          text="Profile complete"
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={`${progress}%`} size="xs" weight="semiBold" style={{ color: tokens.accent }} />
      </View>
      <View style={[styles.progressTrack, { backgroundColor: tokens.backgroundMuted }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: tokens.accent,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <Text
        text="Add an emergency contact to complete your profile."
        size="xxs"
        style={{ color: tokens.textMuted }}
      />
    </SurfaceCard>
  )
}

function ProfileSectionCard({ items, title }: { items: ProfileRowItem[]; title: string }) {
  return (
    <SectionBlock title={title}>
      <ListCard>
        {items.map((item, index) => (
          <ProfileRow
            key={`${title}-${item.label}`}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ListCard>
    </SectionBlock>
  )
}

function ProfileRow({ item, isLast }: { item: ProfileRowItem; isLast: boolean }) {
  const router = useRouter()
  const tokens = useDesignTokens()
  const canPress = Boolean(item.route || item.onPress)

  const handlePress = () => {
    if (item.onPress) {
      item.onPress()
      return
    }

    if (item.route) {
      router.push(item.route)
    }
  }

  return (
    <ListCardItem
      isLast={isLast}
      subtitle={item.value}
      subtitleStyle={{ color: item.destructive ? tokens.danger : tokens.textSecondary }}
      title={item.label}
      titleStyle={{ color: item.destructive ? tokens.danger : tokens.textPrimary }}
      onPress={canPress ? handlePress : undefined}
      leading={
        <Ionicons
          color={item.destructive ? tokens.danger : tokens.textSecondary}
          name={item.icon}
          size={17}
          style={styles.rowIcon}
        />
      }
      trailing={
        item.rightAccessory ??
        (item.badge ? (
          <Pill label={item.badge} tone="accent" />
        ) : item.showChevron !== false && canPress ? (
          <Ionicons color={tokens.textMuted} name="chevron-forward" size={15} />
        ) : null)
      }
    />
  )
}

function VersionFooter() {
  const tokens = useDesignTokens()

  return (
    <Text
      text="Vesta Employee · v1.0.0"
      size="xxs"
      style={[styles.versionLabel, { color: tokens.textMuted }]}
    />
  )
}

function createRightLabel(label: string, tokens: DesignTokens) {
  return (
    <View style={styles.rightLabel}>
      <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
    </View>
  )
}

function TogglePill({ active }: { active: boolean }) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.togglePill,
        { backgroundColor: active ? tokens.success : tokens.surfaceTertiary },
      ]}
    >
      <View
        style={[
          styles.toggleKnob,
          {
            backgroundColor: "#FFFFFF",
            transform: [{ translateX: active ? 20 : 0 }],
          },
        ]}
      />
    </View>
  )
}

export function ProfileScreen() {
  const tokens = useDesignTokens()
  const router = useRouter()
  const { themeContext } = useAppTheme()
  const { signOut } = useAuthActions()
  const { selectedEmployer, state: profileState } = useProfileStateQuery()
  const { state: scheduleState } = useScheduleStateQuery()
  const timeQuery = useTimeDataQuery()
  const fallbackState = createInitialState()
  const state = {
    ...fallbackState,
    ...profileState,
    earnings: timeQuery.data?.earnings ?? fallbackState.earnings,
    shifts: scheduleState?.shifts ?? fallbackState.shifts,
    timeEntries: timeQuery.data?.timeEntries ?? fallbackState.timeEntries,
  }

  const fullName = `${state.profile.firstName} ${state.profile.lastName}`
  const role = capitalize(state.profile.role)
  const employerName = selectedEmployer?.name ?? "No employer"
  const profileCompleteness = 95

  const stats = useMemo(
    () => [
      { label: "Shifts", value: String(state.shifts.length + state.timeEntries.length) },
      { label: "Worked", value: formatWorkedHours(state.earnings.hoursWorked) },
      { label: "Tenure", value: "8mo" },
    ],
    [state.earnings.hoursWorked, state.shifts.length, state.timeEntries.length],
  )

  const notificationCount = useMemo(
    () =>
      Object.values(state.profile.notificationPreferences).filter((preference) => preference)
        .length,
    [state.profile.notificationPreferences],
  )

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You'll need to sign in again to access your account.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut()
          router.replace("/(auth)/sign-in")
        },
      },
    ])
  }

  const sections: Record<ProfileSection, ProfileRowItem[]> = {
    personal: [
      {
        icon: "person-outline",
        label: "Personal details",
        route: "/profile/personal",
        value: fullName,
      },
      {
        icon: "mail-outline",
        label: "Contact details",
        route: "/profile/contact",
        value: state.profile.email,
      },
      {
        icon: "location-outline",
        label: "Address",
        route: "/profile/address",
        value: `${state.profile.address.city || state.profile.homeCity}, ${state.profile.address.country}`,
      },
      {
        icon: "card-outline",
        label: "Bank details",
        route: "/profile/banking",
        value: maskIban(state.profile.bankAccount.iban),
      },
      {
        icon: "document-text-outline",
        label: "Legal information",
        route: "/profile/legal",
        value: "National reg. · Tax ID",
      },
    ],
    employment: [
      {
        badge: state.employers.length > 0 ? "Active" : undefined,
        icon: "business-outline",
        label: `${state.employers.length} employer${state.employers.length === 1 ? "" : "s"}`,
        route: "/profile/employers",
        value: state.employers.map((employer) => employer.name).join(", ") || "None",
      },
      {
        icon: "refresh-outline",
        label: "Switch employer",
        route: state.employers.length > 1 ? "/profile/switch-employer" : "/profile/employers",
        value: `Currently: ${employerName}`,
      },
    ],
    settings: [
      {
        icon: themeContext === "dark" ? "moon-outline" : "sunny-outline",
        label: "Appearance",
        route: "/profile/appearance",
        rightAccessory: createRightLabel(themeContext === "dark" ? "Dark" : "Light", tokens),
        value: themeContext === "dark" ? "Dark" : "Light",
      },
      {
        icon: "notifications-outline",
        label: "Notifications",
        route: "/profile/preferences",
        value: `${notificationCount} enabled`,
        rightAccessory: <TogglePill active={notificationCount > 0} />,
      },
      {
        icon: "globe-outline",
        label: "Language",
        route: "/profile/language",
        value: state.profile.language,
      },
      {
        icon: "shield-checkmark-outline",
        label: "Security",
        route: "/profile/security",
        value: `Password, ${state.profile.security.biometricType}`,
      },
      {
        icon: "lock-closed-outline",
        label: "Privacy",
        route: "/profile/privacy",
        value: "Data & permissions",
      },
    ],
    support: [
      {
        icon: "help-circle-outline",
        label: "Help & support",
        route: "/profile/support",
        value: "FAQs, contact Vesta",
      },
    ],
  }

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screenContent}>
      <ProfileHeader
        email={state.profile.email}
        employerName={employerName}
        fullName={fullName}
        initials={getInitials(state.profile.firstName, state.profile.lastName)}
        role={role}
      />

      <SurfaceCard style={styles.statsWrapper}>
        <StatCard stats={stats} />
      </SurfaceCard>
      <CompletenessCard progress={profileCompleteness} />

      {Object.entries(sections).map(([section, items]) => (
        <ProfileSectionCard
          key={section}
          title={SECTION_TITLES[section as ProfileSection]}
          items={items}
        />
      ))}

      <ListCard>
        <ProfileRow
          isLast
          item={{
            destructive: true,
            icon: "log-out-outline",
            label: "Sign out",
            onPress: handleSignOut,
            showChevron: false,
          }}
        />
      </ListCard>

      <VersionFooter />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  avatarFrame: {
    alignSelf: "center",
    marginBottom: 14,
  },
  avatarProgressRing: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 45,
    borderWidth: 3,
    height: 90,
    justifyContent: "center",
    width: 90,
  },
  cameraButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1.5,
    bottom: 3,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 3,
    width: 24,
  },
  completenessCard: {
    borderRadius: 16,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  employerPill: {
    alignItems: "center",
    alignSelf: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    maxWidth: "92%",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTrack: {
    borderCurve: "continuous",
    borderRadius: 999,
    height: 4,
    overflow: "hidden",
  },
  rightLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  rowIcon: {
    width: 17,
  },
  screenContent: {
    gap: 16,
    paddingHorizontal: 16,
  },
  statsWrapper: {
    borderRadius: 16,
    padding: 10,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  toggleKnob: {
    borderRadius: 13.5,
    height: 27,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    width: 27,
  },
  togglePill: {
    borderRadius: 15.5,
    height: 31,
    justifyContent: "center",
    paddingHorizontal: 2,
    width: 51,
  },
  versionLabel: {
    marginBottom: 4,
    textAlign: "center",
  },
})
