/* eslint-disable react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuthActions } from "@/features/auth/data/auth.mutations"
import { useProfileStateQuery } from "@/features/profile/data/profile.queries"
import {
  AppButton,
  AppScrollScreen,
  AppSegmentedControl,
  SelectionCard,
  SelectionChip,
  SelectionRow,
  Text,
  ToggleSwitch,
  useDesignTokens,
} from "@/ui"

import { AuthTextField } from "./AuthTextField"

const totalSteps = 6
const roles = [
  { id: "Waiter", label: "Waiter", icon: "restaurant-outline" as const },
  { id: "Bartender", label: "Bartender", icon: "wine-outline" as const },
  { id: "Chef", label: "Chef", icon: "fast-food-outline" as const },
  { id: "Host", label: "Host/ess", icon: "people-outline" as const },
  { id: "Cashier", label: "Cashier", icon: "card-outline" as const },
  { id: "Manager", label: "Manager", icon: "briefcase-outline" as const },
  { id: "Driver", label: "Driver", icon: "car-outline" as const },
  { id: "Cleaner", label: "Cleaner", icon: "sparkles-outline" as const },
  { id: "Other", label: "Other", icon: "add-outline" as const },
]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const timeSlots = [
  { id: "mornings", label: "Mornings", sub: "6:00 - 14:00" },
  { id: "evenings", label: "Evenings", sub: "14:00 - 23:00" },
  { id: "full", label: "Full day", sub: "6:00 - 23:00" },
  { id: "flexible", label: "Flexible", sub: "I'll specify" },
]
const notificationOptions = [
  {
    key: "shifts",
    icon: "calendar-outline" as const,
    label: "Shift updates",
    desc: "Reminders before your shift starts",
  },
  {
    key: "schedule",
    icon: "calendar-outline" as const,
    label: "Schedule changes",
    desc: "When your schedule is updated",
  },
  {
    key: "payslips",
    icon: "document-text-outline" as const,
    label: "New payslip",
    desc: "When your payslip is ready",
  },
  {
    key: "timeoff",
    icon: "notifications-outline" as const,
    label: "Request updates",
    desc: "Time off and swap responses",
  },
  {
    key: "updates",
    icon: "notifications-outline" as const,
    label: "App updates",
    desc: "New features and improvements",
  },
]

export function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { completeOnboarding } = useAuthActions()
  const { state: accountState } = useProfileStateQuery()
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState(accountState?.profile.role ?? "")
  const [selectedEmployerId, setSelectedEmployerId] = useState(accountState?.activeEmployerId ?? "")
  const [joinMode, setJoinMode] = useState<"code" | "search">("code")
  const [code, setCode] = useState("")
  const [search, setSearch] = useState("")
  const [joined, setJoined] = useState(Boolean(accountState?.activeEmployerId))
  const [availabilityDays, setAvailabilityDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"])
  const [timeSlot, setTimeSlot] = useState("evenings")
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    shifts: true,
    schedule: true,
    payslips: true,
    timeoff: true,
    updates: false,
  })

  const employers = useMemo(
    () => [
      ...(accountState?.employers ?? []),
      ...(accountState?.employerDirectory.filter(
        (employer) =>
          !(accountState?.employers ?? []).some(
            (joinedEmployer) => joinedEmployer.id === employer.id,
          ),
      ) ?? []),
    ],
    [accountState?.employerDirectory, accountState?.employers],
  )
  const selectedEmployer = employers.find((employer) => employer.id === selectedEmployerId)
  const foundEmployer = employers.find(
    (employer) => employer.code.toUpperCase() === code.toUpperCase(),
  )
  const searchResults =
    search.trim().length > 1
      ? employers.filter(
          (employer) =>
            employer.name.toLowerCase().includes(search.toLowerCase()) ||
            employer.city.toLowerCase().includes(search.toLowerCase()),
        )
      : []
  const activeEmployer = foundEmployer ?? selectedEmployer
  const canContinue = [
    true,
    Boolean(selectedRole),
    joined || Boolean(activeEmployer),
    availabilityDays.length > 0,
    true,
    true,
  ][step]

  const complete = async () => {
    const result = await completeOnboarding({
      role: selectedRole || "Waiter",
      employerId:
        (activeEmployer ?? accountState?.employers[0])?.id ?? accountState?.activeEmployerId ?? "",
    })
    if (!result.ok) return
    router.replace("/")
  }

  const next = () => {
    if (step === totalSteps - 1) {
      complete()
      return
    }
    if (step === 2 && activeEmployer) {
      setSelectedEmployerId(activeEmployer.id)
      setJoined(true)
    }
    setStep((current) => Math.min(totalSteps - 1, current + 1))
  }

  const back = () => setStep((current) => Math.max(0, current - 1))

  if (step === 0) {
    return (
      <AppScrollScreen
        contentContainerStyle={[styles.welcomeScreen, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.welcomeArt}>
          <View style={[styles.welcomeHaloOuter, { backgroundColor: tokens.accentSoft }]} />
          <View style={[styles.welcomeHaloInner, { backgroundColor: tokens.accentSoft }]} />
          <View style={[styles.welcomeMark, { backgroundColor: tokens.textPrimary }]}>
            <Text
              text="V"
              weight="bold"
              style={{ color: tokens.background, fontSize: 54, lineHeight: 62 }}
            />
          </View>
        </View>
        <View style={styles.welcomeCopy}>
          <Text
            text={`Welcome to Vesta,\n${accountState?.profile.firstName ?? "there"}.`}
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 32, lineHeight: 38 }}
          />
          <Text
            text="Let's get your account set up in just a few steps. It'll only take 2 minutes."
            size="sm"
            style={{ color: tokens.textSecondary }}
          />
          <Pressable
            onPress={next}
            style={[styles.darkButton, { backgroundColor: tokens.textPrimary }]}
          >
            <Text
              text="Get started"
              size="sm"
              weight="semiBold"
              style={{ color: tokens.background }}
            />
            <Ionicons color={tokens.background} name="arrow-forward-outline" size={18} />
          </Pressable>
          <Pressable onPress={complete} style={styles.skipButton}>
            <Text text="Skip for now" size="xxs" style={{ color: tokens.textMuted }} />
          </Pressable>
        </View>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.stepHeader}>
        <Pressable
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

      <View style={styles.stepContent}>
        {step === 1 ? (
          <RoleStep selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        ) : null}
        {step === 2 ? (
          <EmployerStep
            code={code}
            employers={employers}
            joined={joined}
            joinMode={joinMode}
            search={search}
            searchResults={searchResults}
            selectedEmployerId={selectedEmployerId}
            onCodeChange={(value) => {
              setCode(
                value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 6),
              )
              setJoined(false)
            }}
            onJoin={() => {
              if (activeEmployer) {
                setSelectedEmployerId(activeEmployer.id)
                setJoined(true)
              }
            }}
            onModeChange={(mode) => {
              setJoinMode(mode)
              setCode("")
              setSearch("")
              setJoined(false)
            }}
            onSearchChange={setSearch}
            onSelectEmployer={(id) => {
              setSelectedEmployerId(id)
              setJoined(false)
            }}
            previewEmployer={activeEmployer}
          />
        ) : null}
        {step === 3 ? (
          <AvailabilityStep
            availabilityDays={availabilityDays}
            onDayToggle={(day) =>
              setAvailabilityDays((current) =>
                current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
              )
            }
            onTimeSlotChange={setTimeSlot}
            timeSlot={timeSlot}
          />
        ) : null}
        {step === 4 ? (
          <NotificationsStep
            notifications={notifications}
            onToggle={(key) =>
              setNotifications((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
          />
        ) : null}
        {step === 5 ? (
          <DoneStep
            availabilityDays={availabilityDays}
            employerName={activeEmployer?.name}
            enabledNotifications={Object.values(notifications).filter(Boolean).length}
            role={roles.find((item) => item.id === selectedRole)?.label ?? selectedRole}
          />
        ) : null}
      </View>

      <AppButton
        disabled={!canContinue}
        label={
          step === 5 ? "Start using Vesta" : step === 2 && !joined ? "Skip for now" : "Continue"
        }
        onPress={next}
      />
    </AppScrollScreen>
  )
}

function ProgressDots({ step }: { step: number }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.progressDots}>
      {Array.from({ length: totalSteps - 1 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            {
              backgroundColor:
                index === step ? tokens.accent : index < step ? tokens.accentSoft : tokens.border,
              width: index === step ? 20 : 6,
            },
          ]}
        />
      ))}
    </View>
  )
}

function RoleStep({
  selectedRole,
  onSelectRole,
}: {
  selectedRole: string
  onSelectRole: (role: string) => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="What's your role?"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 26, lineHeight: 32 }}
        />
        <Text
          text="We'll personalize your experience for how you work."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={styles.roleGrid}>
        {roles.map((role) => {
          return (
            <SelectionCard
              key={role.id}
              onPress={() => onSelectRole(role.id)}
              selected={selectedRole === role.id}
              style={styles.roleCard}
              title={role.label}
              icon={<Ionicons color={tokens.textPrimary} name={role.icon} size={22} />}
            />
          )
        })}
      </View>
    </View>
  )
}

function EmployerStep({
  code,
  joined,
  joinMode,
  previewEmployer,
  search,
  searchResults,
  selectedEmployerId,
  onCodeChange,
  onJoin,
  onModeChange,
  onSearchChange,
  onSelectEmployer,
}: {
  code: string
  employers: unknown[]
  joined: boolean
  joinMode: "code" | "search"
  previewEmployer?: {
    id: string
    code: string
    name: string
    type: string
    city: string
    teamSize: number
    rating: number
  }
  search: string
  searchResults: {
    id: string
    code: string
    name: string
    type: string
    city: string
    teamSize: number
    rating: number
  }[]
  selectedEmployerId: string
  onCodeChange: (value: string) => void
  onJoin: () => void
  onModeChange: (mode: "code" | "search") => void
  onSearchChange: (value: string) => void
  onSelectEmployer: (id: string) => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="Join your employer"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 26, lineHeight: 32 }}
        />
        <Text
          text="Enter the 6-digit code from your manager or search by name."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <AppSegmentedControl
        onChange={onModeChange}
        options={[
          { label: "Invite code", value: "code" },
          { label: "Search", value: "search" },
        ]}
        style={styles.segmentedControl}
        value={joinMode}
      />

      {joinMode === "code" ? (
        <View style={styles.stack}>
          <CodeBoxes code={code} />
          <AuthTextField
            autoCapitalize="characters"
            label="Invite code"
            maxLength={6}
            onChangeText={onCodeChange}
            value={code}
          />
          <Text
            text={
              code.length === 0
                ? "Type or paste your invite code"
                : code.length < 6
                  ? `${6 - code.length} more character${code.length === 5 ? "" : "s"}`
                  : previewEmployer
                    ? "Employer found!"
                    : "Code not recognized"
            }
            size="xxs"
            style={{ color: tokens.textMuted, textAlign: "center" }}
          />
        </View>
      ) : (
        <View style={styles.stack}>
          <AuthTextField
            label="Search"
            labelCase="default"
            onChangeText={onSearchChange}
            placeholder="Search by name or city..."
            value={search}
          />
          {searchResults.map((employer) => (
            <EmployerRow
              key={employer.id}
              employer={employer}
              selected={selectedEmployerId === employer.id}
              onPress={() => onSelectEmployer(employer.id)}
            />
          ))}
        </View>
      )}

      {previewEmployer ? (
        <View
          style={[
            styles.employerPreview,
            { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
          ]}
        >
          <View style={styles.employerHeader}>
            <View style={[styles.employerInitial, { backgroundColor: tokens.textPrimary }]}>
              <Text
                text={previewEmployer.name[0]}
                size="sm"
                weight="bold"
                style={{ color: tokens.background }}
              />
            </View>
            <View style={styles.flex}>
              <Text
                text={previewEmployer.name}
                size="sm"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text={`${previewEmployer.type} · ${previewEmployer.city}`}
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
            <View style={styles.rating}>
              <Ionicons color={tokens.warning} name="star" size={13} />
              <Text
                text={String(previewEmployer.rating)}
                size="xxs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
            </View>
          </View>
          <View style={styles.previewStats}>
            <PreviewStat label="Employees" value={String(previewEmployer.teamSize)} />
            <PreviewStat label="Hiring" value="Open" />
          </View>
          <AppButton label={joined ? "Request sent" : "Request to join"} onPress={onJoin} />
        </View>
      ) : null}

      {joined && previewEmployer ? (
        <View
          style={[
            styles.joinedCard,
            { backgroundColor: `${tokens.success}10`, borderColor: `${tokens.success}26` },
          ]}
        >
          <Ionicons color={tokens.success} name="checkmark-circle-outline" size={24} />
          <View style={styles.flex}>
            <Text
              text="Request sent!"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text
              text={`You'll be notified when ${previewEmployer.name} approves you.`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
        </View>
      ) : null}
    </View>
  )
}

function CodeBoxes({ code }: { code: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.codeRow}>
      {Array.from({ length: 6 }).map((_, index) => {
        const filled = index < code.length
        return (
          <View
            key={index}
            style={[
              styles.codeBox,
              {
                backgroundColor: filled ? tokens.accentSoft : tokens.background,
                borderColor: filled ? tokens.textPrimary : tokens.border,
              },
            ]}
          >
            <Text
              text={code[index] ?? ""}
              weight="bold"
              style={{ color: tokens.textPrimary, fontSize: 21, lineHeight: 26 }}
            />
          </View>
        )
      })}
    </View>
  )
}

function EmployerRow({
  employer,
  selected,
  onPress,
}: {
  employer: { id: string; name: string; type: string; city: string; rating: number }
  selected: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <SelectionRow
      onPress={onPress}
      selected={selected}
      subtitle={`${employer.type} · ${employer.city}`}
      title={employer.name}
      leading={
        <View style={[styles.searchIcon, { backgroundColor: tokens.background }]}>
          <Ionicons color={tokens.textSecondary} name="location-outline" size={15} />
        </View>
      }
      trailing={
        <View style={styles.rating}>
          <Ionicons color={tokens.warning} name="star" size={11} />
          <Text text={String(employer.rating)} size="xxs" style={{ color: tokens.textSecondary }} />
        </View>
      }
    />
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.previewStat, { backgroundColor: tokens.background }]}>
      <Text
        text={value}
        size="xs"
        weight="semiBold"
        style={{ color: tokens.textPrimary, textAlign: "center" }}
      />
      <Text
        text={label}
        style={{ color: tokens.textSecondary, fontSize: 11, lineHeight: 14, textAlign: "center" }}
      />
    </View>
  )
}

function AvailabilityStep({
  availabilityDays,
  onDayToggle,
  onTimeSlotChange,
  timeSlot,
}: {
  availabilityDays: string[]
  onDayToggle: (day: string) => void
  onTimeSlotChange: (slot: string) => void
  timeSlot: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="Your availability"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 26, lineHeight: 32 }}
        />
        <Text
          text="Let your employer know when you can work. You can always change this later."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Text text="DAYS" size="xxs" weight="semiBold" style={{ color: tokens.textMuted }} />
      <View style={styles.dayWrap}>
        {days.map((day) => {
          return (
            <SelectionChip
              key={day}
              onPress={() => onDayToggle(day)}
              label={day}
              selected={availabilityDays.includes(day)}
            />
          )
        })}
      </View>

      <Text text="TYPICAL HOURS" size="xxs" weight="semiBold" style={{ color: tokens.textMuted }} />
      {timeSlots.map((slot) => (
        <ChoiceRow
          key={slot.id}
          selected={timeSlot === slot.id}
          subtitle={slot.sub}
          title={slot.label}
          onPress={() => onTimeSlotChange(slot.id)}
        />
      ))}
    </View>
  )
}

function NotificationsStep({
  notifications,
  onToggle,
}: {
  notifications: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="Stay in the loop"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 26, lineHeight: 32 }}
        />
        <Text
          text="Choose what updates you'd like to receive. You can change these anytime."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={[styles.notificationList, { borderColor: tokens.border }]}>
        {notificationOptions.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.notificationRow,
              index < notificationOptions.length - 1
                ? { borderBottomColor: tokens.border, borderBottomWidth: 1 }
                : null,
            ]}
          >
            <View
              style={[
                styles.notificationIcon,
                { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
              ]}
            >
              <Ionicons color={tokens.textSecondary} name={item.icon} size={16} />
            </View>
            <View style={styles.flex}>
              <Text text={item.label} size="xs" style={{ color: tokens.textPrimary }} />
              <Text text={item.desc} size="xxs" style={{ color: tokens.textMuted }} />
            </View>
            <ToggleSwitch value={notifications[item.key]} onChange={() => onToggle(item.key)} />
          </View>
        ))}
      </View>
    </View>
  )
}

function DoneStep({
  availabilityDays,
  employerName,
  enabledNotifications,
  role,
}: {
  availabilityDays: string[]
  employerName?: string
  enabledNotifications: number
  role: string
}) {
  const tokens = useDesignTokens()
  const rows = [
    { label: "Role", value: role || "Waiter" },
    { label: "Employer", value: employerName ?? "Pending" },
    { label: "Availability", value: `${availabilityDays.length} days/week` },
    { label: "Notifications", value: `${enabledNotifications} enabled` },
  ]

  return (
    <View style={[styles.stackLarge, styles.doneContent]}>
      <View style={[styles.doneIcon, { backgroundColor: `${tokens.success}1A` }]}>
        <Ionicons color={tokens.success} name="checkmark-outline" size={44} />
      </View>
      <View style={styles.titleBlock}>
        <Text
          text="You're all set!"
          weight="bold"
          style={{ color: tokens.textPrimary, fontSize: 28, lineHeight: 34, textAlign: "center" }}
        />
        <Text
          text="Your Vesta account is ready. Here's what we set up for you."
          size="xs"
          style={{ color: tokens.textSecondary, textAlign: "center" }}
        />
      </View>
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
        ]}
      >
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.summaryRow,
              index < rows.length - 1
                ? { borderBottomColor: tokens.border, borderBottomWidth: 1 }
                : null,
            ]}
          >
            <Text text={row.label} size="xs" style={{ color: tokens.textSecondary }} />
            <Text
              text={row.value}
              size="xs"
              weight="medium"
              style={{ color: tokens.textPrimary }}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

function ChoiceRow({
  selected,
  subtitle,
  title,
  onPress,
}: {
  selected: boolean
  subtitle: string
  title: string
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <SelectionRow
      onPress={onPress}
      selected={selected}
      subtitle={subtitle}
      title={title}
      trailing={
        selected ? (
          <View style={[styles.smallCheck, { backgroundColor: tokens.accent }]}>
            <Ionicons color={tokens.accentForeground} name="checkmark-outline" size={13} />
          </View>
        ) : null
      }
    />
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
  codeBox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 56,
    justifyContent: "center",
    width: 44,
  },
  codeRow: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  darkButton: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 16,
  },
  dayWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  doneContent: {
    alignItems: "center",
    paddingTop: 16,
  },
  doneIcon: {
    alignItems: "center",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  employerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  employerInitial: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  employerPreview: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  flex: {
    flex: 1,
  },
  joinedCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  notificationIcon: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  notificationList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  notificationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  previewStat: {
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewStats: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    borderRadius: 3,
    height: 6,
  },
  progressDots: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  rating: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  roleCard: {
    width: "31%",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  segmentedControl: {
    borderRadius: 14,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  smallCheck: {
    alignItems: "center",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  stack: {
    gap: 10,
  },
  stackLarge: {
    gap: 20,
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
  summaryCard: {
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  titleBlock: {
    gap: 6,
  },
  welcomeArt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 260,
  },
  welcomeCopy: {
    gap: 12,
  },
  welcomeHaloInner: {
    borderRadius: 99,
    height: 200,
    opacity: 0.72,
    position: "absolute",
    width: 200,
  },
  welcomeHaloOuter: {
    borderRadius: 120,
    height: 240,
    opacity: 0.5,
    position: "absolute",
    width: 240,
  },
  welcomeMark: {
    alignItems: "center",
    borderRadius: 90,
    height: 180,
    justifyContent: "center",
    width: 180,
  },
  welcomeScreen: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
  },
})
