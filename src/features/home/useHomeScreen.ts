import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "expo-router"

import type { AppNavigationRoute, Shift } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { payslips } from "@/features/documents/documents.data"
import { useHomeQuery } from "@/features/home/data/home.queries"
import { useProfileQuery } from "@/features/profile/data/profile.queries"
import { getPayrollProfileGaps } from "@/features/profile/payrollProfile"

import type { TaskItem } from "./components/HomeTaskSections"
import { deriveHomeScreenPolicy, sortTasksByUrgency } from "./homeScreenPolicy"

// Maps the first payroll gap to the profile-detail section that edits it, so the
// nudge deep-links employees straight to the field that's holding up payroll.
const GAP_SECTION_ROUTE: Record<string, string> = {
  firstName: "/profile/personal",
  lastName: "/profile/personal",
  email: "/profile/contact",
  phone: "/profile/contact",
  iban: "/profile/banking",
  ssin: "/profile/legal",
  address: "/profile/address",
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function useHomeScreen() {
  const router = useRouter()
  const { data: home, isError, isLoading, refetch } = useHomeQuery()
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery()
  const { runAction } = useAppAction()
  const [greeting, setGreeting] = useState(getGreeting())
  const [payrollNudgeDismissed, setPayrollNudgeDismissed] = useState(false)
  const latestPayslip = payslips[0]

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const upcomingShifts = home?.shifts.slice(0, 6) ?? []
  const pendingTasks = useMemo(
    () => sortTasksByUrgency((home?.tasks ?? []).filter((task) => !task.completed)),
    [home?.tasks],
  )
  const unreadCount = home?.unreadNotifications ?? 0
  const policy = deriveHomeScreenPolicy({
    notifications: home?.notifications ?? [],
    pendingTasks,
    unreadCount,
    upcomingShifts,
  })

  const navigate = useCallback((route: AppNavigationRoute) => router.push(route as never), [router])
  const openShift = useCallback(
    (shift: Shift) => router.push(`/(app)/shift/${shift.id}` as never),
    [router],
  )
  const completeTask = useCallback((task: TaskItem) => void runAction(task.action), [runAction])

  const payrollProfileGaps = useMemo(
    () => (profile ? getPayrollProfileGaps(profile) : []),
    [profile],
  )
  // Loaded, has gaps, and not dismissed this session. We never persist the
  // dismissal — payroll matters, so it's fine for the nudge to return next launch.
  const shouldShowPayrollNudge =
    !isProfileLoading && payrollProfileGaps.length > 0 && !payrollNudgeDismissed
  const dismissPayrollNudge = useCallback(() => setPayrollNudgeDismissed(true), [])
  const openPayrollProfile = useCallback(() => {
    const route = payrollProfileGaps[0]
      ? (GAP_SECTION_ROUTE[payrollProfileGaps[0].key] ?? "/profile/personal")
      : "/profile/personal"
    router.push(route as never)
  }, [payrollProfileGaps, router])

  return {
    completeTask,
    greeting,
    home,
    isError,
    isLoading,
    refetch,
    homeSummary: policy.homeSummary,
    nextShift: policy.nextShift,
    openNotifications: () => navigate("/(app)/(tabs)/inbox"),
    openLatestPayslip: () => {
      if (!latestPayslip) return
      router.push(`/(app)/document-payslip/${latestPayslip.id}` as never)
    },
    openPayrollProfile,
    openSchedule: () => navigate("/(app)/(tabs)/schedule"),
    openShift,
    openTasks: () => navigate("/(app)/tasks"),
    payrollProfileGaps,
    dismissPayrollNudge,
    shouldShowPayrollNudge,
    pendingTasks,
    priorityTask: policy.priorityTask,
    runAction,
    shouldShowTasksSection: policy.shouldShowTasksSection,
    shouldShowUpdatesSection: policy.shouldShowUpdatesSection,
    unreadCount,
    upcomingShifts,
  }
}
