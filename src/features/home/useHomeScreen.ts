import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "expo-router"

import type { AppNavigationRoute, Shift } from "@/core/models"
import { payslips } from "@/features/documents/documents.data"
import { useAppAction } from "@/features/actions/useAppAction"
import { useHomeQuery } from "@/features/home/data/home.queries"

import type { TaskItem } from "./components/HomeTaskSections"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function useHomeScreen() {
  const router = useRouter()
  const home = useHomeQuery()
  const { runAction } = useAppAction()
  const [greeting, setGreeting] = useState(getGreeting())
  const latestPayslip = payslips[0]

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const upcomingShifts = home?.shifts.slice(1, 7) ?? []
  const pendingTasks = useMemo(
    () => (home?.tasks ?? []).filter((task) => !task.completed),
    [home?.tasks],
  )

  const navigate = useCallback((route: AppNavigationRoute) => router.push(route as never), [router])
  const openShift = useCallback(
    (shift: Shift) => router.push(`/(app)/shift/${shift.id}` as never),
    [router],
  )
  const completeTask = useCallback((task: TaskItem) => void runAction(task.action), [runAction])

  return {
    completeTask,
    greeting,
    home,
    openNotifications: () => navigate("/notifications"),
    openLatestPayslip: () => {
      if (!latestPayslip) return
      router.push(`/(app)/document-payslip/${latestPayslip.id}` as never)
    },
    openSchedule: () => navigate("/(app)/(tabs)/schedule"),
    openShift,
    pendingTasks,
    runAction,
    router,
    upcomingShifts,
  }
}
