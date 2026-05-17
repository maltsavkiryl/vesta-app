/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useEffect, useMemo, useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { getShiftTimeRange } from "@/core/date"
import type { HomeTask, NotificationItem, Shift, ShiftStatus } from "@/core/models"
import { AppButton, AppScrollScreen, SurfaceCard } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import type { DesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

const completedTaskHistory: TaskItem[] = [
  {
    id: "task-history-1",
    title: "Sign schedule amendment",
    subtitle: "Addendum requires your signature",
    urgency: "medium",
    actionLabel: "Sign",
    href: "/(app)/(tabs)/documents",
    completed: true,
    completedDate: "Apr 20",
  },
  {
    id: "task-history-2",
    title: "Update bank details",
    subtitle: "Required for payroll",
    urgency: "high",
    actionLabel: "Update",
    href: "/(app)/(tabs)/profile",
    completed: true,
    completedDate: "Apr 15",
  },
  {
    id: "task-history-3",
    title: "Set April availability",
    subtitle: "Completed on time",
    urgency: "low",
    actionLabel: "Done",
    href: "/(app)/(tabs)/schedule",
    completed: true,
    completedDate: "Apr 1",
  },
]

const notificationIconByKind = {
  announcements: "megaphone-outline",
  availability: "calendar-number-outline",
  clock: "time-outline",
  documents: "alert-circle-outline",
  payroll: "document-text-outline",
  schedule: "calendar-outline",
} as const

const taskIconByUrgency = {
  high: "alert-circle-outline",
  low: "calendar-outline",
  medium: "alert-circle-outline",
} as const

type HomeRoute =
  | "/(app)/(tabs)/documents"
  | "/(app)/(tabs)/profile"
  | "/(app)/(tabs)/schedule"
  | "/(app)/(tabs)/time"
  | "/notifications"

type IconName = keyof typeof Ionicons.glyphMap
type Tone = "accent" | "success" | "warning" | "danger"
type TaskItem = HomeTask & { completedDate?: string }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function formatCurrency(value: number) {
  return `€${value.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getToneColor(tokens: DesignTokens, tone: Tone) {
  return {
    accent: tokens.accent,
    danger: tokens.danger,
    success: tokens.success,
    warning: tokens.warning,
  }[tone]
}

function getStatusColor(tokens: DesignTokens, status: ShiftStatus) {
  return {
    changed: tokens.warning,
    confirmed: tokens.success,
    pending: tokens.textMuted,
  }[status]
}

function Header({
  employerName,
  firstName,
  greeting,
  hasUnread,
  role,
  onEmployerPress,
  onNotificationsPress,
}: {
  employerName?: string
  firstName: string
  greeting: string
  hasUnread: boolean
  role?: string
  onEmployerPress: () => void
  onNotificationsPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <Text text={greeting} size="xxs" style={{ color: tokens.textSecondary }} />
        <Text
          text={firstName}
          weight="bold"
          style={[styles.headerTitle, { color: tokens.textPrimary }]}
        />
        {employerName ? (
          <Pressable onPress={onEmployerPress} style={styles.employerButton}>
            <View style={[styles.employerDot, { backgroundColor: tokens.success }]} />
            <Text
              text={role ? `${employerName} · ${role}` : employerName}
              numberOfLines={1}
              size="xxs"
              weight="medium"
              style={[styles.employerLabel, { color: tokens.accent }]}
            />
            <Ionicons color={tokens.accent} name="chevron-down-outline" size={13} />
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={onNotificationsPress} hitSlop={10}>
        <View style={[styles.notificationButton, { backgroundColor: tokens.surface }]}>
          <Ionicons color={tokens.textPrimary} name="notifications-outline" size={19} />
          {hasUnread ? (
            <View
              style={[
                styles.notificationDot,
                { backgroundColor: tokens.danger, borderColor: tokens.background },
              ]}
            />
          ) : null}
        </View>
      </Pressable>
    </View>
  )
}

function NextShiftCard({
  shift,
  onClockIn,
  onDetails,
}: {
  shift: Shift
  onClockIn: () => void
  onDetails: () => void
}) {
  const tokens = useDesignTokens()
  const mutedText = tokens.isDark ? "rgba(255, 255, 255, 0.56)" : "rgba(255, 255, 255, 0.50)"
  const faintText = tokens.isDark ? "rgba(255, 255, 255, 0.42)" : "rgba(255, 255, 255, 0.34)"
  const panelColor = tokens.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.06)"

  return (
    <View
      style={[styles.heroCard, { backgroundColor: tokens.isDark ? tokens.surface : "#1C1C1E" }]}
    >
      <View style={styles.heroRingLarge} />
      <View style={styles.heroRingSmall} />

      <View style={styles.heroTop}>
        <View style={styles.flex}>
          <Text
            text="TODAY'S SHIFT"
            size="xxs"
            weight="semiBold"
            style={[styles.capsLabel, { color: faintText }]}
          />
          <Text
            text={getShiftTimeRange(shift)}
            weight="bold"
            style={[styles.heroTime, { color: "#FFFFFF" }]}
          />
          <Text
            text={`${shift.role} · Evening shift`}
            size="xxs"
            style={{ color: mutedText, marginTop: 2 }}
          />
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${tokens.success}32` }]}>
          <Text text="Confirmed" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
        </View>
      </View>

      <Pressable onPress={onDetails} style={[styles.locationRow, { backgroundColor: panelColor }]}>
        <Ionicons color={faintText} name="location-outline" size={14} />
        <Text
          text={`${shift.venueName} · ${shift.venueAddress}`}
          numberOfLines={1}
          size="xxs"
          style={[styles.flex, { color: mutedText }]}
        />
        <Ionicons color={faintText} name="navigate-outline" size={13} />
      </Pressable>

      <View style={styles.clockNotice}>
        <Ionicons color={tokens.warning} name="flash-outline" size={12} />
        <Text
          text="Clock-in opens at 16:45 · 3h away"
          size="xxs"
          weight="medium"
          style={{ color: tokens.warning }}
        />
      </View>

      <View style={styles.heroActions}>
        <AppButton label="Clock in" onPress={onClockIn} />
        <Pressable
          onPress={onDetails}
          style={[styles.detailsButton, { backgroundColor: panelColor }]}
        >
          <Text text="View details" size="xs" weight="medium" style={{ color: "#FFFFFFCC" }} />
        </Pressable>
      </View>
    </View>
  )
}

function SectionHeader({
  actionLabel,
  badgeLabel,
  title,
  onAction,
}: {
  actionLabel?: string
  badgeLabel?: string
  title: string
  onAction?: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.sectionHeader}>
      <Text
        text={title}
        size="sm"
        weight="semiBold"
        style={[styles.sectionTitle, { color: tokens.textPrimary }]}
      />
      <View style={styles.sectionActions}>
        {badgeLabel ? (
          <View style={[styles.pendingBadge, { backgroundColor: `${tokens.danger}14` }]}>
            <Text text={badgeLabel} size="xxs" weight="semiBold" style={{ color: tokens.danger }} />
          </View>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={styles.inlineAction}>
            <Text text={actionLabel} size="xs" weight="medium" style={{ color: tokens.accent }} />
            {actionLabel === "See all" || actionLabel === "All" ? (
              <Ionicons color={tokens.accent} name="arrow-forward-outline" size={13} />
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

function UpcomingShiftCard({ shift, onPress }: { shift: Shift; onPress: () => void }) {
  const tokens = useDesignTokens()
  const dayNumber = shift.date.split("-")[2]

  return (
    <Pressable onPress={onPress} style={[styles.upcomingCard, { backgroundColor: tokens.surface }]}>
      <View style={styles.upcomingMeta}>
        <Text
          text={shift.dayLabel}
          size="xxs"
          weight="medium"
          style={{ color: tokens.textMuted }}
        />
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor(tokens, shift.status) }]}
        />
      </View>
      <Text
        text={dayNumber}
        weight="bold"
        style={[styles.dayNumber, { color: tokens.textPrimary }]}
      />
      <Text text={shift.startTime} size="xxs" style={{ color: tokens.textSecondary }} />
      <View style={[styles.rolePill, { backgroundColor: tokens.background }]}>
        <Text
          text={shift.role}
          numberOfLines={1}
          size="xxs"
          weight="medium"
          style={{ color: tokens.textSecondary }}
        />
      </View>
    </Pressable>
  )
}

function UpcomingShifts({
  shifts,
  onShiftPress,
  onSeeAll,
}: {
  shifts: Shift[]
  onShiftPress: (shift: Shift) => void
  onSeeAll: () => void
}) {
  return (
    <View>
      <SectionHeader title="Upcoming" actionLabel="See all" onAction={onSeeAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.upcomingList}
      >
        {shifts.map((shift) => (
          <UpcomingShiftCard key={shift.id} shift={shift} onPress={() => onShiftPress(shift)} />
        ))}
      </ScrollView>
    </View>
  )
}

function EarningsCard({
  averageHourlyRate,
  earnedAmount,
  hoursWorked,
  monthLabel,
  shiftsWorked,
  targetAmount,
  onPayslipPress,
}: {
  averageHourlyRate: number
  earnedAmount: number
  hoursWorked: number
  monthLabel: string
  shiftsWorked: number
  targetAmount: number
  onPayslipPress: () => void
}) {
  const tokens = useDesignTokens()
  const progress = Math.round((earnedAmount / targetAmount) * 100)

  return (
    <SurfaceCard style={styles.earningsCard}>
      <View style={styles.earningsTop}>
        <View style={styles.flex}>
          <Text
            text={`${monthLabel} earnings`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
          <Text
            text={formatCurrency(earnedAmount)}
            weight="bold"
            style={[styles.earningsAmount, { color: tokens.textPrimary }]}
          />
          <Text
            text={`of €${targetAmount.toLocaleString("en")} target · ${progress}%`}
            size="xxs"
            style={{ color: tokens.textMuted }}
          />
        </View>
        <View style={[styles.trendIcon, { backgroundColor: `${tokens.accent}14` }]}>
          <Ionicons color={tokens.accent} name="trending-up-outline" size={19} />
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: tokens.background }]}>
        <View
          style={[styles.progressValue, { backgroundColor: tokens.accent, width: `${progress}%` }]}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCell label="Shifts" value={String(shiftsWorked)} />
        <StatCell label="Hours" value={`${hoursWorked}h`} />
        <StatCell label="Avg/hr" value={formatCurrency(averageHourlyRate)} />
      </View>

      <Pressable onPress={onPayslipPress} style={styles.payslipLink}>
        <Ionicons color={tokens.accent} name="card-outline" size={14} />
        <Text
          text="View latest payslip"
          size="xxs"
          weight="medium"
          style={{ color: tokens.accent }}
        />
        <Ionicons color={tokens.accent} name="chevron-forward-outline" size={14} />
      </Pressable>
    </SurfaceCard>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.statCell, { backgroundColor: tokens.background }]}>
      <Text text={value} size="xs" weight="bold" style={{ color: tokens.textPrimary }} />
      <Text text={label} size="xxs" style={{ color: tokens.textMuted }} />
    </View>
  )
}

function ToneIcon({ name, tone }: { name: IconName; tone: Tone }) {
  const tokens = useDesignTokens()
  const color = getToneColor(tokens, tone)

  return (
    <View style={[styles.iconTile, { backgroundColor: `${color}14` }]}>
      <Ionicons color={color} name={name} size={17} />
    </View>
  )
}

function TaskRow({
  item,
  onComplete,
  onDismiss,
}: {
  item: TaskItem
  onComplete: () => void
  onDismiss?: () => void
}) {
  const tokens = useDesignTokens()
  const tone = item.urgency === "high" ? "danger" : item.urgency === "medium" ? "warning" : "accent"

  return (
    <View style={[styles.listRow, { borderBottomColor: tokens.border }]}>
      <ToneIcon
        name={item.completed ? "checkmark-circle-outline" : taskIconByUrgency[item.urgency]}
        tone={item.completed ? "success" : tone}
      />
      <View style={styles.flex}>
        <Text
          text={item.title}
          numberOfLines={1}
          size="xs"
          weight="medium"
          style={[
            { color: item.completed ? tokens.textSecondary : tokens.textPrimary },
            item.completed && styles.completedText,
          ]}
        />
        <Text
          text={item.completed ? `Done ${item.completedDate}` : item.subtitle}
          numberOfLines={1}
          size="xxs"
          style={{ color: item.completed ? tokens.textMuted : tokens.textSecondary }}
        />
      </View>
      {item.completed ? (
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={17} />
      ) : (
        <View style={styles.taskActions}>
          <Pressable
            onPress={onComplete}
            style={[styles.taskButton, { backgroundColor: `${tokens.accent}14` }]}
          >
            <Text
              text={item.actionLabel}
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accent }}
            />
          </Pressable>
          {onDismiss ? (
            <Pressable
              onPress={onDismiss}
              style={[styles.dismissButton, { backgroundColor: tokens.background }]}
            >
              <Ionicons color={tokens.textMuted} name="checkmark-outline" size={14} />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  )
}

function TasksSection({
  tasks,
  onComplete,
  onDismiss,
  onShowAll,
}: {
  tasks: TaskItem[]
  onComplete: (task: TaskItem) => void
  onDismiss: (task: TaskItem) => void
  onShowAll: () => void
}) {
  const tokens = useDesignTokens()

  if (tasks.length === 0) {
    return (
      <View
        style={[
          styles.allDone,
          { backgroundColor: `${tokens.success}10`, borderColor: `${tokens.success}20` },
        ]}
      >
        <ToneIcon name="checkmark-outline" tone="success" />
        <View style={styles.flex}>
          <Text
            text="All tasks done!"
            size="xs"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text="Nothing pending right now."
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Pressable onPress={onShowAll}>
          <Text text="History" size="xxs" weight="medium" style={{ color: tokens.accent }} />
        </Pressable>
      </View>
    )
  }

  return (
    <View>
      <SectionHeader
        title="Tasks"
        actionLabel="View all"
        badgeLabel={`${tasks.length} pending`}
        onAction={onShowAll}
      />
      <SurfaceCard style={styles.listCard}>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            item={task}
            onComplete={() => onComplete(task)}
            onDismiss={() => onDismiss(task)}
          />
        ))}
      </SurfaceCard>
    </View>
  )
}

function QuickAction({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: IconName
  label: string
  tone: Tone
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <ToneIcon name={icon} tone={tone} />
      <Text
        text={label}
        numberOfLines={1}
        size="xxs"
        weight="medium"
        style={{ color: tokens.textPrimary }}
      />
    </Pressable>
  )
}

function QuickActions({ navigate }: { navigate: (route: HomeRoute) => void }) {
  return (
    <View>
      <SectionHeader title="Quick actions" />
      <View style={styles.quickGrid}>
        <QuickAction
          icon="calendar-outline"
          label="Schedule"
          tone="accent"
          onPress={() => navigate("/(app)/(tabs)/schedule")}
        />
        <QuickAction
          icon="time-outline"
          label="Clock in"
          tone="success"
          onPress={() => navigate("/(app)/(tabs)/time")}
        />
        <QuickAction
          icon="cloud-upload-outline"
          label="Upload"
          tone="warning"
          onPress={() => navigate("/(app)/(tabs)/documents")}
        />
        <QuickAction
          icon="document-text-outline"
          label="Payslips"
          tone="danger"
          onPress={() => navigate("/(app)/(tabs)/documents")}
        />
      </View>
    </View>
  )
}

function UpdateRow({ item, onPress }: { item: NotificationItem; onPress: () => void }) {
  const tokens = useDesignTokens()
  const tone = item.kind === "documents" ? "danger" : item.kind === "payroll" ? "success" : "accent"

  return (
    <Pressable onPress={onPress} style={[styles.updateRow, { borderBottomColor: tokens.border }]}>
      <ToneIcon name={notificationIconByKind[item.kind]} tone={tone} />
      <View style={styles.flex}>
        <View style={styles.updateTitleRow}>
          <Text
            text={item.title}
            numberOfLines={1}
            size="xxs"
            weight="semiBold"
            style={[styles.flex, { color: tokens.textPrimary }]}
          />
          <Text text={item.relativeTime} size="xxs" style={{ color: tokens.textMuted }} />
        </View>
        <Text
          text={item.body}
          numberOfLines={1}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
    </Pressable>
  )
}

function UpdatesSection({
  notifications,
  onNotificationPress,
  onShowAll,
}: {
  notifications: NotificationItem[]
  onNotificationPress: (notification: NotificationItem) => void
  onShowAll: () => void
}) {
  return (
    <View>
      <SectionHeader title="Updates" actionLabel="All" onAction={onShowAll} />
      <View>
        {notifications.slice(0, 3).map((notification) => (
          <UpdateRow
            key={notification.id}
            item={notification}
            onPress={() => onNotificationPress(notification)}
          />
        ))}
      </View>
    </View>
  )
}

function TaskDrawer({
  pendingTasks,
  visible,
  onClose,
  onComplete,
}: {
  pendingTasks: TaskItem[]
  visible: boolean
  onClose: () => void
  onComplete: (task: TaskItem) => void
}) {
  const tokens = useDesignTokens()

  return (
    <Modal
      allowSwipeDismissal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.nativeSheet, { backgroundColor: tokens.background }]}>
        <View style={styles.nativeSheetHeader}>
          <Text
            text="All Tasks"
            weight="bold"
            style={[styles.sheetTitle, { color: tokens.textPrimary }]}
          />
          <Pressable
            accessibilityLabel="Close"
            onPress={onClose}
            style={[styles.sheetCloseButton, { backgroundColor: tokens.surface }]}
          >
            <Ionicons color={tokens.textSecondary} name="close-outline" size={18} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.nativeSheetContent}
          showsVerticalScrollIndicator={false}
        >
          <TaskGroup
            title="Pending"
            tasks={pendingTasks}
            backgroundColor={tokens.surface}
            onComplete={(task) => {
              onClose()
              onComplete(task)
            }}
          />
          <TaskGroup
            title="Completed"
            tasks={completedTaskHistory}
            backgroundColor={tokens.surface}
            onComplete={() => undefined}
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

function TaskGroup({
  backgroundColor,
  onComplete,
  tasks,
  title,
}: {
  backgroundColor: string
  onComplete: (task: TaskItem) => void
  tasks: TaskItem[]
  title: string
}) {
  const tokens = useDesignTokens()

  if (tasks.length === 0) return null

  return (
    <View style={styles.drawerGroup}>
      <Text
        text={title.toUpperCase()}
        size="xxs"
        weight="semiBold"
        style={[styles.capsLabel, { color: tokens.textMuted }]}
      />
      <View style={[styles.drawerGroupCard, { backgroundColor }]}>
        {tasks.map((task) => (
          <TaskRow key={task.id} item={task} onComplete={() => onComplete(task)} />
        ))}
      </View>
    </View>
  )
}

export function HomeScreen() {
  const router = useRouter()
  const { selectedEmployer, state, unreadNotifications } = useAppSession()
  const [greeting, setGreeting] = useState(getGreeting())
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>([])
  const [isTaskDrawerVisible, setIsTaskDrawerVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const nextShift = state.shifts[0]
  const upcomingShifts = state.shifts.slice(1, 7)
  const pendingTasks = useMemo(
    () => state.tasks.filter((task) => !hiddenTaskIds.includes(task.id)),
    [hiddenTaskIds, state.tasks],
  )

  const navigate = (route: HomeRoute) => router.push(route as never)
  const openShift = (shift: Shift) => router.push(`/(app)/shift/${shift.id}` as never)
  const completeTask = (task: TaskItem) => {
    setHiddenTaskIds((ids) => (ids.includes(task.id) ? ids : [...ids, task.id]))
    router.push(task.href as never)
  }

  return (
    <>
      <AppScrollScreen contentContainerStyle={styles.screenContent}>
        <Header
          employerName={selectedEmployer?.name}
          firstName={state.profile.firstName}
          greeting={greeting}
          hasUnread={unreadNotifications > 0}
          role={state.profile.role}
          onEmployerPress={() => navigate("/(app)/(tabs)/profile")}
          onNotificationsPress={() => navigate("/notifications")}
        />

        <View style={styles.stack}>
          <NextShiftCard
            shift={nextShift}
            onClockIn={() => navigate("/(app)/(tabs)/time")}
            onDetails={() => openShift(nextShift)}
          />

          <UpcomingShifts
            shifts={upcomingShifts}
            onShiftPress={openShift}
            onSeeAll={() => navigate("/(app)/(tabs)/schedule")}
          />

          <EarningsCard
            averageHourlyRate={state.earnings.averageHourlyRate}
            earnedAmount={state.earnings.earnedAmount}
            hoursWorked={state.earnings.hoursWorked}
            monthLabel={state.earnings.monthLabel}
            shiftsWorked={state.earnings.shiftsWorked}
            targetAmount={state.earnings.targetAmount}
            onPayslipPress={() => navigate("/(app)/(tabs)/documents")}
          />

          <TasksSection
            tasks={pendingTasks}
            onComplete={completeTask}
            onDismiss={(task) =>
              setHiddenTaskIds((ids) => (ids.includes(task.id) ? ids : [...ids, task.id]))
            }
            onShowAll={() => setIsTaskDrawerVisible(true)}
          />

          <QuickActions navigate={navigate} />

          <UpdatesSection
            notifications={state.notifications}
            onNotificationPress={(notification) => {
              if (notification.deepLink) router.push(notification.deepLink as never)
            }}
            onShowAll={() => navigate("/notifications")}
          />
        </View>
      </AppScrollScreen>

      <TaskDrawer
        pendingTasks={pendingTasks}
        visible={isTaskDrawerVisible}
        onClose={() => setIsTaskDrawerVisible(false)}
        onComplete={completeTask}
      />
    </>
  )
}

const styles = StyleSheet.create({
  allDone: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  capsLabel: {
    letterSpacing: 0,
  },
  clockNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
    paddingLeft: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  dayNumber: {
    fontSize: 26,
    lineHeight: 28,
  },
  detailsButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  dismissButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  drawerGroup: {
    gap: 8,
    paddingTop: 16,
  },
  drawerGroupCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  earningsAmount: {
    fontSize: 30,
    lineHeight: 36,
    marginTop: 3,
  },
  earningsCard: {
    borderRadius: 20,
    gap: 14,
    padding: 18,
  },
  earningsTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  employerButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
    maxWidth: 260,
  },
  employerDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  employerLabel: {
    flexShrink: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
  },
  heroCard: {
    borderCurve: "continuous",
    borderRadius: 22,
    gap: 14,
    overflow: "hidden",
    padding: 20,
  },
  heroRingLarge: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 100,
    borderWidth: 1,
    height: 200,
    position: "absolute",
    right: -60,
    top: -60,
    width: 200,
  },
  heroRingSmall: {
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 65,
    borderWidth: 1,
    height: 130,
    position: "absolute",
    right: -30,
    top: -30,
    width: 130,
  },
  heroTime: {
    fontSize: 24,
    lineHeight: 28,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  iconTile: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  inlineAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  listCard: {
    borderRadius: 18,
    gap: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  listRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 61,
    paddingVertical: 13,
  },
  locationRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  nativeSheet: {
    flex: 1,
  },
  nativeSheetContent: {
    gap: 16,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  nativeSheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  notificationButton: {
    alignItems: "center",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    width: 38,
  },
  notificationDot: {
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 7,
    top: 7,
    width: 10,
  },
  payslipLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  pendingBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  progressTrack: {
    borderRadius: 99,
    height: 5,
    overflow: "hidden",
  },
  progressValue: {
    borderRadius: 99,
    height: "100%",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
    gap: 9,
    minWidth: 0,
    paddingBottom: 12,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 9,
  },
  rolePill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    marginTop: 6,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  screenContent: {
    paddingHorizontal: 16,
  },
  sectionActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  sheetCloseButton: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  stack: {
    gap: 14,
    marginTop: 16,
  },
  statCell: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 1,
    gap: 1,
    paddingHorizontal: 6,
    paddingVertical: 9,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taskActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  taskButton: {
    borderCurve: "continuous",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trendIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  upcomingCard: {
    borderCurve: "continuous",
    borderRadius: 18,
    minHeight: 116,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    width: 112,
  },
  upcomingList: {
    gap: 9,
    paddingBottom: 4,
  },
  upcomingMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  updateRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
  },
  updateTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})
