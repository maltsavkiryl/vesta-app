/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Modal, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { AppScrollScreen, Pill, SurfaceCard } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import type { DesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/theme/context"

type ProfileSection = "personal" | "employment" | "settings" | "support"
type ProfileRoute =
  | "/profile/personal"
  | "/profile/preferences"
  | "/profile/employers"
  | "/profile/banking"
  | "/profile/legal"

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

function maskIban(iban: string) {
  return iban.length > 7 ? `${iban.slice(0, 7)}•••` : iban
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
  const tokens = useDesignTokens()

  return (
    <SurfaceCard style={styles.statsCard}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.statCell,
            index < stats.length - 1 && {
              borderRightColor: tokens.border,
              borderRightWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Text text={stat.value} size="md" weight="bold" style={{ color: tokens.textPrimary }} />
          <Text text={stat.label} size="xxs" style={{ color: tokens.textSecondary }} />
        </View>
      ))}
    </SurfaceCard>
  )
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
  const tokens = useDesignTokens()

  return (
    <View style={styles.section}>
      <Text
        text={title.toUpperCase()}
        size="xxs"
        weight="medium"
        style={[styles.sectionTitle, { color: tokens.textMuted }]}
      />
      <View style={[styles.sectionCard, { backgroundColor: tokens.surface }]}>
        {items.map((item, index) => (
          <ProfileRow
            key={`${title}-${item.label}`}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </View>
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
    <Pressable
      accessibilityRole={canPress ? "button" : undefined}
      disabled={!canPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.rowButton,
        {
          borderBottomColor: tokens.transparent,
          opacity: pressed ? 0.68 : 1,
        },
      ]}
    >
      <Ionicons
        color={item.destructive ? tokens.danger : tokens.textSecondary}
        name={item.icon}
        size={17}
        style={styles.rowIcon}
      />
      <View style={styles.rowText}>
        <Text
          text={item.label}
          size="xs"
          weight="normal"
          style={{ color: item.destructive ? tokens.danger : tokens.textPrimary }}
        />
        {item.value ? (
          <Text
            text={item.value}
            numberOfLines={1}
            size="xxs"
            style={{ color: tokens.textMuted }}
          />
        ) : null}
        {item.badge ? <Pill label={item.badge} tone="accent" /> : null}
      </View>
      {item.rightAccessory ??
        (item.showChevron !== false && canPress ? (
          <Ionicons color={tokens.textMuted} name="chevron-forward" size={15} />
        ) : null)}
      {!isLast ? <View style={[styles.rowDivider, { backgroundColor: tokens.border }]} /> : null}
    </Pressable>
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

function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
  title,
}: {
  message: string
  onCancel: () => void
  onConfirm: () => void
  title: string
}) {
  const tokens = useDesignTokens()

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onCancel}>
      <View style={styles.confirmOverlay}>
        <Pressable style={styles.confirmBackdrop} onPress={onCancel} />
        <View style={[styles.confirmCard, { backgroundColor: tokens.surface }]}>
          <View style={[styles.confirmIcon, { backgroundColor: `${tokens.danger}14` }]}>
            <Ionicons color={tokens.danger} name="warning-outline" size={23} />
          </View>
          <Text
            text={title}
            size="sm"
            weight="bold"
            style={{ color: tokens.textPrimary, textAlign: "center" }}
          />
          <Text
            text={message}
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <View style={styles.confirmActions}>
            <Pressable
              onPress={onConfirm}
              style={[styles.confirmDanger, { backgroundColor: tokens.danger }]}
            >
              <Text text="Sign out" size="xs" weight="semiBold" style={{ color: "#FFFFFF" }} />
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={[styles.confirmCancel, { backgroundColor: tokens.background }]}
            >
              <Text text="Cancel" size="xs" weight="medium" style={{ color: tokens.textPrimary }} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export function ProfileScreen() {
  const tokens = useDesignTokens()
  const router = useRouter()
  const { themeContext, setThemeContextOverride } = useAppTheme()
  const { state, selectedEmployer, signOut, updateProfile } = useAppSession()
  const [showSignOut, setShowSignOut] = useState(false)

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
    setShowSignOut(true)
  }

  const toggleAppearance = () => {
    const nextTheme = themeContext === "dark" ? "light" : "dark"
    updateProfile({ themePreference: nextTheme })
    setThemeContextOverride(nextTheme)
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
        route: "/profile/personal",
        value: state.profile.email,
      },
      {
        icon: "location-outline",
        label: "Address",
        route: "/profile/personal",
        value: `${state.profile.homeCity}, Belgium`,
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
        route: "/profile/employers",
        value: `Currently: ${employerName}`,
      },
    ],
    settings: [
      {
        icon: themeContext === "dark" ? "moon-outline" : "sunny-outline",
        label: "Appearance",
        onPress: toggleAppearance,
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
        route: "/profile/preferences",
        value: state.profile.language,
      },
      {
        icon: "shield-checkmark-outline",
        label: "Security",
        route: "/profile/legal",
        value: "Password, Face ID",
      },
      {
        icon: "lock-closed-outline",
        label: "Privacy",
        route: "/profile/legal",
        value: "Data & permissions",
      },
    ],
    support: [
      {
        icon: "help-circle-outline",
        label: "Help & support",
        route: "/profile/preferences",
        value: "FAQs, contact Vesta",
      },
    ],
  }

  return (
    <AppScrollScreen contentContainerStyle={styles.screenContent}>
      <ProfileHeader
        email={state.profile.email}
        employerName={employerName}
        fullName={fullName}
        initials={getInitials(state.profile.firstName, state.profile.lastName)}
        role={role}
      />

      <StatCard stats={stats} />
      <CompletenessCard progress={profileCompleteness} />

      {Object.entries(sections).map(([section, items]) => (
        <ProfileSectionCard
          key={section}
          title={SECTION_TITLES[section as ProfileSection]}
          items={items}
        />
      ))}

      <View style={[styles.signOutCard, { backgroundColor: tokens.surface }]}>
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
      </View>

      <VersionFooter />

      {showSignOut ? (
        <ConfirmDialog
          title="Sign out?"
          message="You'll need to sign in again to access your account."
          onCancel={() => setShowSignOut(false)}
          onConfirm={() => {
            setShowSignOut(false)
            signOut()
            router.replace("/(auth)/sign-in")
          }}
        />
      ) : null}
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
  confirmActions: {
    gap: 8,
    marginTop: 10,
    width: "100%",
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.40)",
  },
  confirmCancel: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    padding: 13,
  },
  confirmCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    gap: 8,
    maxWidth: 310,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: "100%",
  },
  confirmDanger: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    padding: 13,
  },
  confirmIcon: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 2,
    width: 48,
  },
  confirmOverlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
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
  rowButton: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 45,
    position: "absolute",
    right: 0,
  },
  rowIcon: {
    width: 17,
  },
  rowText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  screenContent: {
    gap: 0,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionCard: {
    borderRadius: 16,
    gap: 0,
    overflow: "hidden",
    padding: 0,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  signOutCard: {
    borderRadius: 16,
    gap: 0,
    marginBottom: 20,
    overflow: "hidden",
    padding: 0,
  },
  statCell: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  statsCard: {
    borderRadius: 16,
    flexDirection: "row",
    gap: 0,
    marginBottom: 20,
    padding: 0,
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
